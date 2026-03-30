-- ==============================
-- Create Users Table
-- ==============================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  name TEXT,
  role TEXT,
  department TEXT,
  manager_id INTEGER
);

DELETE FROM users;

INSERT INTO users (username, password, name, role, department, manager_id)
VALUES
('khaled', '1234', 'Khaled', 'General Manager', 'Management', NULL),
('ahmed', '1234', 'Ahmed', 'HR Manager', 'HR', 1),
('sara', '1234', 'Sara', 'Employee', 'HR', 2);


-- ==============================
-- Create Requests Table
-- ==============================

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
