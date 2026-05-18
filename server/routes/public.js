const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { customAlphabet } = require('nanoid');
const verifyCaptcha = require('../middleware/captcha');

// Generate unique ID in format XXXX-XXXX-XXXX
const generateUniqueId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 12);

const formatId = (id) => {
  return `${id.slice(0, 4)}-${id.slice(4, 8)}-${id.slice(8, 12)}`;
};

// FR-01: Get current matchday and fixtures
router.get('/matchday/current', async (req, res) => {
  try {
    const matchdayResult = await pool.query(
      `SELECT * FROM matchdays 
       WHERE status = 'Active' 
       ORDER BY start_date DESC 
       LIMIT 1`
    );

    if (matchdayResult.rows.length === 0) {
      return res.json({ 
        success: true, 
        matchday: null,
        matches: [] 
      });
    }

    const matchday = matchdayResult.rows[0];

    const matchesResult = await pool.query(
      `SELECT * FROM matches 
       WHERE matchday_id = $1 
       ORDER BY match_date ASC`,
      [matchday.id]
    );

    res.json({
      success: true,
      matchday,
      matches: matchesResult.rows
    });
  } catch (error) {
    console.error('Error fetching current matchday:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch matchday data' 
    });
  }
});

// FR-02, FR-03, FR-04: Create pool entry with CAPTCHA
router.post('/pool/create', verifyCaptcha, async (req, res) => {
  const { userName, predictions, matchdayId } = req.body;

  if (!userName || !predictions || !matchdayId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if matchday is still open
    const matchdayCheck = await client.query(
      `SELECT m.*, 
              (SELECT MIN(match_date) FROM matches WHERE matchday_id = m.id) as first_match_date
       FROM matchdays m 
       WHERE m.id = $1`,
      [matchdayId]
    );

    if (matchdayCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid matchday' 
      });
    }

    const matchday = matchdayCheck.rows[0];
    const now = new Date();

    // FR-10: Check if registration is locked (first match has started)
    if (matchday.first_match_date && new Date(matchday.first_match_date) <= now) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        error: 'Registration is closed. The matchday has already started.' 
      });
    }

    // Generate unique ID
    let uniqueId;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const rawId = generateUniqueId();
      uniqueId = formatId(rawId);
      
      const existing = await client.query(
        'SELECT unique_id FROM pools WHERE unique_id = $1',
        [uniqueId]
      );

      if (existing.rows.length === 0) break;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      await client.query('ROLLBACK');
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate unique ID' 
      });
    }

    // Create pool entry
    await client.query(
      `INSERT INTO pools (unique_id, user_name, matchday_id, payment_status) 
       VALUES ($1, $2, $3, 'Pending')`,
      [uniqueId, userName, matchdayId]
    );

    // Insert predictions
    for (const prediction of predictions) {
      await client.query(
        `INSERT INTO predictions (pool_id, match_id, predicted_value) 
         VALUES ($1, $2, $3)`,
        [uniqueId, prediction.matchId, prediction.predictedValue]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      uniqueId,
      message: 'Entry created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating pool entry:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create entry' 
    });
  } finally {
    client.release();
  }
});

// FR-05: Check payment status by ID
router.get('/pool/status/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT unique_id, user_name, payment_status, registration_date 
       FROM pools 
       WHERE unique_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Entry not found' 
      });
    }

    res.json({
      success: true,
      entry: result.rows[0]
    });
  } catch (error) {
    console.error('Error checking pool status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check status' 
    });
  }
});

// FR-06: Get matchday board (paid entries only) - UPDATED: Show only In_Progress and Finished
router.get('/matchday/:id/board', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if matchday is In_Progress or Finished
    const matchdayCheck = await pool.query(
      `SELECT * FROM matchdays WHERE id = $1 AND status IN ('In_Progress', 'Finished')`,
      [id]
    );

    if (matchdayCheck.rows.length === 0) {
      return res.json({
        success: true,
        board: [],
        matchday: null,
        message: 'Board not available yet'
      });
    }

    const matchday = matchdayCheck.rows[0];

    const result = await pool.query(
      `SELECT 
         p.unique_id,
         p.user_name,
         json_agg(
           json_build_object(
             'matchId', m.id,
             'homeTeam', m.home_team,
             'awayTeam', m.away_team,
             'prediction', pr.predicted_value,
             'points', pr.points_earned,
             'finalResult', m.final_result
           ) ORDER BY m.match_date
         ) as predictions,
         SUM(pr.points_earned) as total_points
       FROM pools p
       JOIN predictions pr ON p.unique_id = pr.pool_id
       JOIN matches m ON pr.match_id = m.id
       WHERE p.matchday_id = $1 AND p.payment_status = 'Paid'
       GROUP BY p.unique_id, p.user_name
       ORDER BY total_points DESC, p.user_name ASC`,
      [id]
    );

    res.json({
      success: true,
      matchday,
      board: result.rows
    });
  } catch (error) {
    console.error('Error fetching matchday board:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch board' 
    });
  }
});

// FR-07: Get overall tournament standings
router.get('/standings/overall', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM overall_standings LIMIT 100`
    );

    res.json({
      success: true,
      standings: result.rows
    });
  } catch (error) {
    console.error('Error fetching overall standings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch standings' 
    });
  }
});

module.exports = router;
