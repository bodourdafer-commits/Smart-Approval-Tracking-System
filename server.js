const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const db = new sqlite3.Database("database.db");


// POST: ارسال طلب جديد
app.post("/requests", (req, res) => {

    const { user_id, request_type, description } = req.body;

    const sql = `
    INSERT INTO requests (user_id, request_type, description, status)
    VALUES (?, ?, ?, 'Submitted')
    `;

    db.run(sql, [user_id, request_type, description], function(err){

        if(err){
            return res.status(500).json({error: err.message});
        }

        res.json({
            message: "Request submitted successfully",
            request_id: this.lastID
        });

    });

});


// GET: عرض طلبات الموظف
app.get("/my-requests/:user_id", (req, res) => {

    const user_id = req.params.user_id;

    const sql = `
    SELECT * FROM requests
    WHERE user_id = ?
    `;

    db.all(sql, [user_id], (err, rows)=>{

        if(err){
            return res.status(500).json({error: err.message});
        }

        res.json(rows);

    });

});


// POST: موافقة المدير او رفض الطلب
app.post("/approve-request", (req, res)=>{

    const { request_id, status } = req.body;

    const sql = `
    UPDATE requests
    SET status = ?
    WHERE id = ?
    `;

    db.run(sql, [status, request_id], function(err){

        if(err){
            return res.status(500).json({error: err.message});
        }

        res.json({
            message: "Request status updated successfully"
        });

    });

});


// تشغيل السيرفر
app.listen(3000, () => {
    console.log("Server running on port 3000");
});