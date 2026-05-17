-- La Grilla Sports Pool Database Schema

-- Matchdays Table
CREATE TABLE matchdays (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'In_Progress', 'Finished')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    matchday_id INTEGER NOT NULL REFERENCES matchdays(id) ON DELETE CASCADE,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    home_goals INTEGER,
    away_goals INTEGER,
    final_result CHAR(1) CHECK (final_result IN ('H', 'D', 'A')),
    match_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pools Table (Entries)
CREATE TABLE pools (
    unique_id VARCHAR(14) PRIMARY KEY, -- Format: XXXX-XXXX-XXXX
    user_name VARCHAR(100) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid')),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    matchday_id INTEGER NOT NULL REFERENCES matchdays(id) ON DELETE CASCADE
);

-- Predictions Table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    pool_id VARCHAR(14) NOT NULL REFERENCES pools(unique_id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    predicted_value CHAR(1) NOT NULL CHECK (predicted_value IN ('H', 'D', 'A')),
    points_earned INTEGER DEFAULT 0 CHECK (points_earned IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(pool_id, match_id)
);

-- Indexes for performance
CREATE INDEX idx_pools_payment_status ON pools(payment_status);
CREATE INDEX idx_pools_matchday ON pools(matchday_id);
CREATE INDEX idx_matches_matchday ON matches(matchday_id);
CREATE INDEX idx_predictions_pool ON predictions(pool_id);
CREATE INDEX idx_predictions_match ON predictions(match_id);

-- View for Overall Standings
CREATE OR REPLACE VIEW overall_standings AS
SELECT 
    p.unique_id,
    p.user_name,
    SUM(pr.points_earned) as total_points,
    COUNT(DISTINCT p.matchday_id) as matchdays_participated
FROM pools p
JOIN predictions pr ON p.unique_id = pr.pool_id
WHERE p.payment_status = 'Paid'
GROUP BY p.unique_id, p.user_name
ORDER BY total_points DESC, user_name ASC;

-- View for Matchday Leaderboard
CREATE OR REPLACE VIEW matchday_leaderboard AS
SELECT 
    p.unique_id,
    p.user_name,
    p.matchday_id,
    m.name as matchday_name,
    SUM(pr.points_earned) as matchday_points
FROM pools p
JOIN predictions pr ON p.unique_id = pr.pool_id
JOIN matchdays m ON p.matchday_id = m.id
WHERE p.payment_status = 'Paid'
GROUP BY p.unique_id, p.user_name, p.matchday_id, m.name
ORDER BY p.matchday_id DESC, matchday_points DESC, user_name ASC;
