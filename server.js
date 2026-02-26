const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      role TEXT,
      department TEXT,
      manager_id INTEGER
    )
  `);
  db.run(`DELETE FROM users`);
  db.run(`
    INSERT INTO users (name, role, department, manager_id)
    VALUES 
    ('Khaled', 'General Manager', 'Management', NULL),
    ('Ahmed', 'HR Manager', 'HR', 1),
    ('Sara', 'Employee', 'HR', 2)
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

app.get("/", (req, res) => {
  res.send("DB & Logic running 🚀");
});

app.post("/add-request", (req, res) => {
  const { user_id, title, description } = req.body;

  db.run(
    `INSERT INTO requests (user_id, title, description)
     VALUES (?, ?, ?)`,
    [user_id, title, description],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Request created successfully",
        id: this.lastID
      });
    }
  );
});

app.get("/requests", (req, res) => {
  db.all("SELECT * FROM requests", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
function autoEscalateRequests() {
  db.run(`
    UPDATE requests
    SET status = 'Escalated'
    WHERE status = 'Pending'
    AND datetime(created_at) <= datetime('now', '-24 hours')
  `);
}

setInterval(autoEscalateRequests, 60000);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
