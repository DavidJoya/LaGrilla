-- Sample Data for La Grilla Sports Pool System
-- Run this after schema.sql to populate with test data

-- Insert sample matchday
INSERT INTO matchdays (name, start_date, status) VALUES 
('Jornada 1 - Liga MX', '2026-05-20 18:00:00', 'Active');

-- Get the matchday ID (assuming it's 1 for new database)
-- Insert sample matches
INSERT INTO matches (matchday_id, home_team, away_team, match_date) VALUES
(1, 'América', 'Chivas', '2026-05-20 20:00:00'),
(1, 'Cruz Azul', 'Pumas', '2026-05-20 19:00:00'),
(1, 'Tigres', 'Monterrey', '2026-05-21 20:00:00'),
(1, 'Santos', 'León', '2026-05-21 18:00:00'),
(1, 'Toluca', 'Pachuca', '2026-05-22 19:00:00');

-- Insert sample pool entries with predictions
-- Entry 1: El Tigre (Paid)
INSERT INTO pools (unique_id, user_name, matchday_id, payment_status) VALUES
('A7B9-XJ23-P0L1', 'El Tigre', 1, 'Paid');

INSERT INTO predictions (pool_id, match_id, predicted_value) VALUES
('A7B9-XJ23-P0L1', 1, 'H'),
('A7B9-XJ23-P0L1', 2, 'D'),
('A7B9-XJ23-P0L1', 3, 'A'),
('A7B9-XJ23-P0L1', 4, 'H'),
('A7B9-XJ23-P0L1', 5, 'D');

-- Entry 2: Juanito (Paid)
INSERT INTO pools (unique_id, user_name, matchday_id, payment_status) VALUES
('B2C4-YK56-Q8M3', 'Juanito', 1, 'Paid');

INSERT INTO predictions (pool_id, match_id, predicted_value) VALUES
('B2C4-YK56-Q8M3', 1, 'A'),
('B2C4-YK56-Q8M3', 2, 'H'),
('B2C4-YK56-Q8M3', 3, 'H'),
('B2C4-YK56-Q8M3', 4, 'A'),
('B2C4-YK56-Q8M3', 5, 'H');

-- Entry 3: La Reina (Paid)
INSERT INTO pools (unique_id, user_name, matchday_id, payment_status) VALUES
('C5D7-ZL89-R3N6', 'La Reina', 1, 'Paid');

INSERT INTO predictions (pool_id, match_id, predicted_value) VALUES
('C5D7-ZL89-R3N6', 1, 'H'),
('C5D7-ZL89-R3N6', 2, 'A'),
('C5D7-ZL89-R3N6', 3, 'D'),
('C5D7-ZL89-R3N6', 4, 'H'),
('C5D7-ZL89-R3N6', 5, 'A');

-- Entry 4: Pending payment example
INSERT INTO pools (unique_id, user_name, matchday_id, payment_status) VALUES
('D8E1-WM34-S5P9', 'Los Cuates', 1, 'Pending');

INSERT INTO predictions (pool_id, match_id, predicted_value) VALUES
('D8E1-WM34-S5P9', 1, 'D'),
('D8E1-WM34-S5P9', 2, 'H'),
('D8E1-WM34-S5P9', 3, 'A'),
('D8E1-WM34-S5P9', 4, 'D'),
('D8E1-WM34-S5P9', 5, 'H');

-- Simulate some matches with results (for testing the board)
UPDATE matches SET home_goals = 2, away_goals = 1, final_result = 'H' WHERE id = 1;
UPDATE matches SET home_goals = 1, away_goals = 1, final_result = 'D' WHERE id = 2;

-- Recalculate points for finished matches
UPDATE predictions SET points_earned = 1 
WHERE match_id = 1 AND predicted_value = 'H';

UPDATE predictions SET points_earned = 0 
WHERE match_id = 1 AND predicted_value != 'H';

UPDATE predictions SET points_earned = 1 
WHERE match_id = 2 AND predicted_value = 'D';

UPDATE predictions SET points_earned = 0 
WHERE match_id = 2 AND predicted_value != 'D';

-- Verify data
SELECT 
    p.user_name,
    p.payment_status,
    COUNT(pr.id) as predictions_count,
    SUM(pr.points_earned) as total_points
FROM pools p
LEFT JOIN predictions pr ON p.unique_id = pr.pool_id
GROUP BY p.unique_id, p.user_name, p.payment_status
ORDER BY total_points DESC;

COMMIT;
