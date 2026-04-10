const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
    });
  });
});

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

  db.run(sql, [status, id], function (err) {
    if (err) return res.status(500).json({ message: "error" });

    if (this.changes === 0) {
      return res.status(404).json({ message: "not found" });
    }

    res.json({ message: "updated" });
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
