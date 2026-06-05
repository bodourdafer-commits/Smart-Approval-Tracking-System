const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
const sqlite3 = require("sqlite3").verbose();
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
<<<<<<< HEAD
=======
<<<<<<< HEAD

  // Users Table
=======
  
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871
      updated_at TIMESTAMP
    )
  `);

  db.run(`
<<<<<<< HEAD
=======
    ALTER TABLE requests ADD COLUMN updated_at TIMESTAMP
  `, (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log(err.message);
    }
  });

  // Tracking Logs Table
=======
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91
  db.run(`
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871
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

<<<<<<< HEAD
app.post("/login", (req, res) => {
  const { username, password } = req.body;
=======
<<<<<<< HEAD
// Test Request
app.get("/test-request", (req, res) => {
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871

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

<<<<<<< HEAD
=======
// Get Requests
=======

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



>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871
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

<<<<<<< HEAD
=======

>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91
app.get("/requests", (req, res) => {
  db.all("SELECT * FROM requests", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

<<<<<<< HEAD
// Get Users
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Auto Escalation
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871
function autoEscalateRequests() {
  db.run(`
    UPDATE requests
    SET status = 'Escalated', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'Pending'
    AND datetime(created_at) <= datetime('now', '-24 hours')
  `);
}
<<<<<<< HEAD
=======
=======
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871

setInterval(autoEscalateRequests, 60 * 60 * 1000);

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`Server running on http://localhost:${PORT}`);
});
=======
  console.log(`http://localhost:${PORT}`);
});
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
17a920ee321463c01d8966ed9f8e1ed00d1ecafe
>>>>>>> 8bd1b7ae3024bb510b5a9d7e9c806e154ec0a871
