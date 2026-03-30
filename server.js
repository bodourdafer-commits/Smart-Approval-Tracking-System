const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  // Users Table
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

  // Requests Table
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
    ALTER TABLE requests ADD COLUMN updated_at TIMESTAMP
  `, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log(err.message);
    }
  });

  // Tracking Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS tracking_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER,
      action TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

// Seed Data
db.get(`SELECT COUNT(*) AS count FROM requests`, (err, row) => {
  if (err) {
    console.log(err.message);
  } else if (row.count === 0) {
    db.run(`
      INSERT INTO requests (user_id, title, description, status, created_at, updated_at)
      VALUES
      (3, 'Vacation', 'Need 3 days leave', 'Pending', CURRENT_TIMESTAMP, NULL),
      (3, 'Sick Leave', 'Need 2 days sick leave', 'Approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    db.run(`
      INSERT INTO tracking_logs (request_id, action)
      VALUES
      (1, 'Submitted'),
      (2, 'Submitted'),
      (2, 'Approved')
    `);
  }
});

// Root Test
app.get("/", (req, res) => {
  res.send("DB & Logic running 🚀");
});

// Test Request
app.get("/test-request", (req, res) => {

  db.run(
    `INSERT INTO requests (user_id, title, description)
     VALUES (?, ?, ?)`,
    [3, "Vacation", "Need 3 days leave"],
    function (err) {

      if (err) return res.send(err);

      const requestId = this.lastID;

      db.run(
        `INSERT INTO tracking_logs (request_id, action)
         VALUES (?, ?)`,
        [requestId, "Submitted"]
      );

      res.send("Test request created");

    }
  );

});

// Add Request
app.post("/add-request", (req, res) => {
  const { user_id, title, description } = req.body;

  db.run(
    `INSERT INTO requests (user_id, title, description)
     VALUES (?, ?, ?)`,
    [user_id, title, description],
    function (err) {

      if (err) return res.status(500).json({ error: err.message });

      const requestId = this.lastID;

      db.run(
        `INSERT INTO tracking_logs (request_id, action)
         VALUES (?, ?)`,
        [requestId, "Submitted"]
      );

      res.json({
        message: "Request created successfully",
        id: requestId
      });

    }
  );
});

// Update Status
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
        `INSERT INTO tracking_logs (request_id, action)
         VALUES (?, ?)`,
        [requestId, status]
      );

      res.json({
        message: "Status updated successfully"
      });

    }
  );

});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT role FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        message: "Login successful",
        role: row.role
      });
    }
  );
});

// Get Requests
app.get("/requests", (req, res) => {
  db.all("SELECT * FROM requests", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get Users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Auto Escalation
function autoEscalateRequests() {
  db.run(`
    UPDATE requests
    SET status = 'Escalated'
    WHERE status = 'Pending'
    AND datetime(created_at) <= datetime('now', '-24 hours')
  `);
}

setInterval(autoEscalateRequests, 60000);

// Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});