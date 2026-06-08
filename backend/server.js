  const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) console.error("Database connection error:", err.message);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT,
        department TEXT,
        manager_id INTEGER
    )`);

    db.run(`INSERT OR IGNORE INTO users (username, password, name, role, department, manager_id)
        VALUES
        ('khaled', '1234', 'Khaled', 'General Manager', 'Management', NULL),
        ('ahmed', '1234', 'Ahmed', 'HR Manager', 'HR', 1),
        ('sara', '1234', 'Sara', 'Employee', 'HR', 2)
    `);

    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS tracking_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER,
        action TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'mabelle.reichel72@ethereal.email',
        pass: '6mCDKSpYV2YbyP2P23'
    }
});

function sendEscalationEmail(requestId, requestTitle) {
    const mailOptions = {
        from: 'mabelle.reichel72@ethereal.email',
        to: 'bodourdafer@gmail.com',
        subject: `⚠️ SLA Alert: Request #${requestId} Has Been Escalated!`,
        text: `Attention Manager,\n\nThe request titled "${requestTitle}" (ID: #${requestId}) has been pending for over 24 hours without action.\n\nFollowing corporate SLA policies, this request has been automatically escalated to your dashboard for immediate review.\n\nSmart Approval Intelligence System.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Email Error:", error);
        } else {
            console.log("Escalation Email Sent Successfully!");
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
    });
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(401).json({ error: "Invalid credentials" });
            res.json({ message: "Login successful", user });
        }
    );
});

app.get('/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/requests', (req, res) => {
    db.all("SELECT * FROM requests", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/my-requests/:user_id', (req, res) => {
    db.all("SELECT * FROM requests WHERE user_id = ?", [req.params.user_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/requests', (req, res) => {
    const { user_id, title, request_type, description } = req.body;
    const finalTitle = title || request_type || "HR Request";

    db.run(
        `INSERT INTO requests (user_id, title, description, status) VALUES (?, ?, ?, 'Pending')`,
        [user_id, finalTitle, description],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const requestId = this.lastID;
            db.run("INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)", [requestId, "Submitted"]);
            res.json({ message: "Request submitted successfully", request_id: requestId });
        }
    );
});

app.put('/update-status/:id', (req, res) => {
    const requestId = req.params.id;
    const { status } = req.body;

    db.run(
        `UPDATE requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, requestId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run("INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)", [requestId, status]);
            res.json({ message: `Request status updated to ${status} successfully` });
        }
    );
});

app.get('/api/dashboard/analytics', (req, res) => {
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
        res.json({
            approved: stats.approved || 0,
            rejected: stats.rejected || 0,
            pending: stats.pending || 0,
            escalated: stats.escalated || 0
        });
    });
});

function autoEscalateAndNotify() {
    const selectSql = `SELECT id, title FROM requests WHERE status = 'Pending' AND datetime(created_at) <= datetime('now', '-24 hours')`;
    
    db.all(selectSql, [], (err, rows) => {
        if (!err && rows.length > 0) {
            rows.forEach(request => {
                sendEscalationEmail(request.id, request.title);
                db.run("INSERT INTO tracking_logs (request_id, action) VALUES (?, ?)", [request.id, "Escalated"]);
            });

            db.run(`
                UPDATE requests
                SET status = 'Escalated', updated_at = CURRENT_TIMESTAMP
                WHERE status = 'Pending'
                AND datetime(created_at) <= datetime('now', '-24 hours')
            `);
            console.log(`[SLA Process] ${rows.length} pending requests automatically escalated.`);
        }
    });
}

setInterval(autoEscalateAndNotify, 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Server running seamlessly at: http://localhost:${PORT}`);
});