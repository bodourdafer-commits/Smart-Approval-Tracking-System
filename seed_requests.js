const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to database.');
  }
});

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT INTO requests (user_id, title, description, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  for (let i = 1; i <= 220; i++) {
    const statuses = ['Pending', 'Approved', 'Rejected', 'Escalated'];
    const status = statuses[i % 4];

    stmt.run(
      3,
      `Demo Request ${i}`,
      `Realistic sample request number ${i} for final demo dataset.`,
      status,
      function (err) {
        if (err) {
          console.error('Insert error:', err.message);
        }
      }
    );
  }

  stmt.finalize((err) => {
    if (err) {
      console.error('Finalize error:', err.message);
    } else {
      console.log('✅ 220 requests inserted.');
    }

    db.all("SELECT status, COUNT(*) as total FROM requests GROUP BY status", [], (err, rows) => {
      if (err) console.error(err.message);
      else console.log(rows);

      db.close();
    });
  });
});