USE lost_found_db;
INSERT IGNORE INTO users (name, email, password, role, verified) VALUES
('Admin User', 'admin@lostandfound.com', 'admin123', 'ADMIN', TRUE);
