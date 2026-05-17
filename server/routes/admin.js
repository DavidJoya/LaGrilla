const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateAdmin = require('../middleware/auth');

// All admin routes require authentication
router.use(authenticateAdmin);

// FR-09: Create new matchday
router.post('/matchday/create', async (req, res) => {
  const { name, startDate } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO matchdays (name, start_date, status) 
       VALUES ($1, $2, 'Active') 
       RETURNING *`,
      [name, startDate]
    );

    res.json({
      success: true,
      matchday: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating matchday:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create matchday' 
    });
  }
});

// FR-09: Add match to matchday
router.post('/match/create', async (req, res) => {
  const { matchdayId, homeTeam, awayTeam, matchDate } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO matches (matchday_id, home_team, away_team, match_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [matchdayId, homeTeam, awayTeam, matchDate]
    );

    res.json({
      success: true,
      match: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create match' 
    });
  }
});

// Get all matchdays
router.get('/matchdays', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
              COUNT(DISTINCT p.unique_id) as total_entries,
              COUNT(DISTINCT CASE WHEN p.payment_status = 'Paid' THEN p.unique_id END) as paid_entries
       FROM matchdays m
       LEFT JOIN pools p ON m.id = p.matchday_id
       GROUP BY m.id
       ORDER BY m.start_date DESC`
    );

    res.json({
      success: true,
      matchdays: result.rows
    });
  } catch (error) {
    console.error('Error fetching matchdays:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch matchdays' 
    });
  }
});

// Get pending entries for payment validation
router.get('/pools/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, m.name as matchday_name
       FROM pools p
       JOIN matchdays m ON p.matchday_id = m.id
       WHERE p.payment_status = 'Pending'
       ORDER BY p.registration_date DESC`
    );

    res.json({
      success: true,
      pendingEntries: result.rows
    });
  } catch (error) {
    console.error('Error fetching pending entries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch pending entries' 
    });
  }
});

// FR-11: Mark entry as paid
router.put('/pool/:id/mark-paid', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE pools 
       SET payment_status = 'Paid' 
       WHERE unique_id = $1 
       RETURNING *`,
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
    console.error('Error marking entry as paid:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update payment status' 
    });
  }
});

// FR-12: Delete all pending entries for a matchday
router.delete('/matchday/:id/cleanup-pending', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM pools 
       WHERE matchday_id = $1 AND payment_status = 'Pending' 
       RETURNING unique_id`,
      [id]
    );

    res.json({
      success: true,
      deletedCount: result.rows.length,
      deletedIds: result.rows.map(r => r.unique_id)
    });
  } catch (error) {
    console.error('Error cleaning up pending entries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to cleanup pending entries' 
    });
  }
});

// FR-13: Update match result
router.put('/match/:id/result', async (req, res) => {
  const { id } = req.params;
  const { homeGoals, awayGoals } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Determine final result
    let finalResult;
    if (homeGoals > awayGoals) {
      finalResult = 'H';
    } else if (homeGoals < awayGoals) {
      finalResult = 'A';
    } else {
      finalResult = 'D';
    }

    // Update match
    await client.query(
      `UPDATE matches 
       SET home_goals = $1, away_goals = $2, final_result = $3 
       WHERE id = $4`,
      [homeGoals, awayGoals, finalResult, id]
    );

    // FR-14: Recalculate points for all predictions of this match
    await client.query(
      `UPDATE predictions 
       SET points_earned = CASE 
         WHEN predicted_value = $1 THEN 1 
         ELSE 0 
       END
       WHERE match_id = $2`,
      [finalResult, id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      finalResult,
      message: 'Match result updated and points recalculated'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating match result:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update match result' 
    });
  } finally {
    client.release();
  }
});

// Update matchday status
router.put('/matchday/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE matchdays 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Matchday not found' 
      });
    }

    res.json({
      success: true,
      matchday: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating matchday status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update matchday status' 
    });
  }
});

// Get matches for a specific matchday
router.get('/matchday/:id/matches', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM matches 
       WHERE matchday_id = $1 
       ORDER BY match_date ASC`,
      [id]
    );

    res.json({
      success: true,
      matches: result.rows
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch matches' 
    });
  }
});

module.exports = router;
