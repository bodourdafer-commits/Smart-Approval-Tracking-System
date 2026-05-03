 const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

// Root Test
app.get("/", (req, res) => {
  res.send("DB & Logic running 🚀 - Sprint 4 Ready");
});


app.post("/requests", (req, res) => {
  const { user_id, request_type, description } = req.body;
  const sql = `INSERT INTO requests (user_id, title, description, status) VALUES (?, ?, ?, 'Submitted')`;

  db.run(sql, [user_id, request_type, description], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const requestId = this.lastID;
    db.run(`INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)`, [requestId, "Submitted"]);
    res.json({ message: "Request submitted successfully", request_id: requestId });
  });
});


app.post("/approve-request", (req, res) => {
  const { request_id, status } = req.body;
  const sql = `UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(sql, [status, request_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run(`INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)`, [request_id, status]);
    res.json({ message: "Request status updated successfully" });
  });
});


app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT role FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "Login successful", role: row.role });
  });
});



app.get("/api/dashboard/analytics", (req, res) => {
  const analytics = {};

  
  const statusSql = `
    SELECT 
      SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'Escalated' THEN 1 ELSE 0 END) as escalated
    FROM requests`;

  db.get(statusSql, [], (err, stats) => {
    if (err) return res.status(500).json({ error: err.message });
    analytics.counts = stats;

    
    const timeSql = `
      SELECT AVG(strftime('%s', updated_at) - strftime('%s', created_at)) / 60 as avg_minutes 
      FROM requests 
      WHERE status IN ('Approved', 'Rejected') AND updated_at IS NOT NULL`;

    db.get(timeSql, [], (err, timeRow) => {
      analytics.avg_approval_time = timeRow.avg_minutes ? Math.round(timeRow.avg_minutes) + " min" : "0 min";
      res.json(analytics);
    });
  });
});


app.get("/my-requests/:user_id", (req, res) => {
  db.all(`SELECT * FROM requests WHERE user_id = ?`, [req.params.user_id], (err, rows) => {
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


function autoEscalateRequests() {
  const checkSql = "SELECT id FROM requests WHERE status = 'Pending' AND datetime(created_at) <= datetime('now', '-24 hours')";
  
  db.all(checkSql, [], (err, rows) => {
    if (err) return;
    rows.forEach((row) => {
      db.run("UPDATE requests SET status = 'Escalated', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [row.id], () => {
        db.run("INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)", [row.id, "Auto-Escalated"]);
      });
    });
  });
}

setInterval(autoEscalateRequests, 60000);

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});