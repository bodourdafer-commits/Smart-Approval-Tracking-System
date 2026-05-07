 HEAD
const express = require("express");
  const express = require("express");
const sqlite3 = require("sqlite3").verbose();
17a920ee321463c01d8966ed9f8e1ed00d1ecafe
const cors = require("cors");
<<<<<<< HEAD
=======
const sqlite3 = require("sqlite3").verbose();
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT,
    request_type TEXT,
    details TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_updated_at DATETIME,
    escalated INTEGER DEFAULT 0
  )
`);

db.run(`
  INSERT OR IGNORE INTO users (username, password, role)
  VALUES 
    ('employee1', '1234', 'employee'),
    ('manager1', '1234', 'manager')
`);

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

  db.get(sql, [username, password], (err, user) => {
    if (err) return res.status(500).json({ message: "error" });
    if (!user) return res.status(401).json({ message: "invalid" });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
<<<<<<< HEAD

  // Users Table
=======
  
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91
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
=======
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91
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

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running and Database connection is established",
  });
});

<<<<<<< HEAD
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
17a920ee321463c01d8966ed9f8e1ed00d1ecafe
    });
  });
});

HEAD
app.post("/requests", (req, res) => {
  const { employee_name, request_type, details, role } = req.body;

  if (role !== "employee") {
    return res.status(403).json({ message: "not allowed" });
  }

  const sql = `
    INSERT INTO requests (employee_name, request_type, details)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [employee_name, request_type, details], function (err) {
    if (err) return res.status(500).json({ message: "error" });

    res.json({
      id: this.lastID
    });
  });
});

app.get("/requests", (req, res) => {
  const sql = `SELECT * FROM requests`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ message: "error" });

    const now = new Date();

    const result = rows.map((r) => {
      const created = new Date(r.created_at);
      const diffMinutes = (now - created) / (1000 * 60);

      let escalated = r.escalated;

      if (r.status === "Pending" && diffMinutes >= 1) {
        escalated = 1;
      }

      return {
        ...r,
        escalated
      };
    });

    res.json(result);
  });
});

app.put("/requests/:id", (req, res) => {
  const id = req.params.id;
  const { status, role } = req.body;

  if (role !== "manager") {
    return res.status(403).json({ message: "not allowed" });
  }

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ message: "invalid status" });
  }

  const sql = `
    UPDATE requests
    SET status = ?, status_updated_at = CURRENT_TIMESTAMP, escalated = 0
    WHERE id = ?
  `;


app.get("/my-requests/:user_id", (req, res) => {
  db.all(`SELECT * FROM requests WHERE user_id = ?`, [req.params.user_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


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
function autoEscalateRequests() {
  db.run(`
    UPDATE requests
    SET status = 'Escalated'
    WHERE status = 'Pending'
    AND datetime(created_at) <= datetime('now', '-24 hours')
  `);
}
=======

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
17a920ee321463c01d8966ed9f8e1ed00d1ecafe

  db.run(sql, [status, id], function (err) {
    if (err) return res.status(500).json({ message: "error" });

HEAD
    if (this.changes === 0) {
      return res.status(404).json({ message: "not found" });
    }

    res.json({ message: "updated" });
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
>>>>>>> 1cc025ff71a59cc3dabcc2f7e09fd9cfe918cf91


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
17a920ee321463c01d8966ed9f8e1ed00d1ecafe
