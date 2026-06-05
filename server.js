const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT,
      department TEXT,
      manager_id INTEGER
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO users (username, password, name, role, department, manager_id)
    VALUES
    ('khaled', '1234', 'Khaled', 'General Manager', 'Management', NULL),
    ('ahmed', '1234', 'Ahmed', 'HR Manager', 'HR', 1),
    ('sara', '1234', 'Sara', 'Employee', 'HR', 2)
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tracking_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      action TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Server is running"
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      res.json({
        message: "Login successful",
        user
      });
    }
  );
});

app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/requests", (req, res) => {
  db.all("SELECT * FROM requests", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/my-requests/:user_id", (req, res) => {
  db.all(
    "SELECT * FROM requests WHERE user_id = ?",
    [req.params.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post("/requests", (req, res) => {
  const { user_id, title, description } = req.body;

  db.run(
    `INSERT INTO requests (user_id, title, description, status)
     VALUES (?, ?, ?, 'Pending')`,
    [user_id, title, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run(
        "INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)",
        [this.lastID, "Submitted"]
      );

      res.json({
        message: "Request submitted successfully",
        request_id: this.lastID
      });
    }
  );
});

app.put("/update-status/:id", (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  db.run(
    `UPDATE requests
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, requestId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.run(
        "INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)",
        [requestId, status]
      );

      res.json({
        message: "Status updated successfully"
      });
    }
  );
});

app.get("/api/dashboard/analytics", (req, res) => {
  const sql = `
    SELECT 
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'Escalated' THEN 1 ELSE 0 END) AS escalated
    FROM requests
  `;

  db.get(sql, [], (err, stats) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(stats);
  });
});

function autoEscalateRequests() {
  db.run(`
    UPDATE requests
    SET status = 'Escalated', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'Pending'
    AND datetime(created_at) <= datetime('now', '-24 hours')
  `);
}

setInterval(autoEscalateRequests, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});