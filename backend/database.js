const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./contest.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

db.serialize(() => {
  // Users table WITH PASSWORD FIELD
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✅ Users table ready');
    }
  });

  // Problems table
  db.run(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      test_cases TEXT NOT NULL,
      time_limit INTEGER DEFAULT 2,
      score INTEGER DEFAULT 100
    )
  `, (err) => {
    if (err) {
      console.error('Error creating problems table:', err);
    } else {
      console.log('✅ Problems table ready');
    }
  });

  // Submissions table
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      problem_id INTEGER,
      code TEXT NOT NULL,
      language TEXT,
      score INTEGER DEFAULT 0,
      time_taken INTEGER DEFAULT 0,
      status TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (problem_id) REFERENCES problems(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating submissions table:', err);
    } else {
      console.log('✅ Submissions table ready');
    }
  });

  // Insert sample problem if not exists
  db.get('SELECT COUNT(*) as count FROM problems', (err, row) => {
    if (!err && row && row.count === 0) {
      db.run(`
        INSERT INTO problems (title, description, test_cases, score)
        VALUES (?, ?, ?, ?)
      `, [
        'Two Sum',
        'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        JSON.stringify([
          { input: '2 7 11 15\\n9', output: '0 1' },
          { input: '3 2 4\\n6', output: '1 2' }
        ]),
        100
      ], (err) => {
        if (err) {
          console.error('Error inserting sample problem:', err);
        } else {
          console.log('✅ Sample problem inserted');
        }
      });
    }
  });
});

module.exports = db;
