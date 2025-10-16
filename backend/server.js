const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { runCode } = require('./codeRunner');
const authRouter = require('./routes/auth');


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all origins
    methods: ["GET", "POST"]
  }
});


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Auth routes
app.use('/api/auth', authRouter);


// Store connected clients
let connectedClients = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  connectedClients.push(socket);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    connectedClients = connectedClients.filter(client => client.id !== socket.id);
  });
});

// Function to broadcast leaderboard updates
function broadcastLeaderboard() {
  db.all(`
    SELECT 
      user_name as name,
      MAX(score) as score,
      MIN(time_taken) as time
    FROM submissions
    GROUP BY user_name
    ORDER BY score DESC, time ASC
    LIMIT 10
  `, (err, rows) => {
    if (!err) {
      io.emit('leaderboard', rows);
      console.log('📊 Leaderboard updated:', rows.length, 'participants');
    }
  });
}

// API Routes

// Get all problems
app.get('/api/problems', (req, res) => {
  db.all('SELECT * FROM problems', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Submit code
app.post('/api/submit', async (req, res) => {
  const { userId, userName, problemId, code, language } = req.body;

  console.log('📝 Received submission from:', userName);

  try {
    // Get problem and test cases
    db.get('SELECT * FROM problems WHERE id = ?', [problemId], async (err, problem) => {
      if (err || !problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }

      const testCases = JSON.parse(problem.test_cases);
      const startTime = Date.now();

      // Run the code
      const result = await runCode(code, testCases);
      const timeTaken = Math.round((Date.now() - startTime) / 1000);

      if (result.success) {
        // Save submission to database
        db.run(`
          INSERT INTO submissions (user_id, user_name, problem_id, code, language, score, time_taken, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, userName, problemId, code, language, result.score, timeTaken, 'completed'], (err) => {
          if (err) {
            console.error('Database error:', err);
          } else {
            console.log('✅ Submission saved');
            // Broadcast updated leaderboard
            broadcastLeaderboard();
          }
        });

        res.json({
          success: true,
          message: `Submission successful! Score: ${result.score}/100`,
          score: result.score,
          passedTests: result.passedTests,
          totalTests: result.totalTests,
          results: result.results
        });
      } else {
        res.json({
          success: false,
          message: result.error,
          details: result.details
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error',
      details: error.message
    });
  }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  db.all(`
    SELECT 
      user_name as name,
      MAX(score) as score,
      MIN(time_taken) as time
    FROM submissions
    GROUP BY user_name
    ORDER BY score DESC, time ASC
    LIMIT 10
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('');

  console.log('🚀 ============================================');
  console.log('🚀  Backend Server Running!');
  console.log('🚀 ============================================');
  console.log(`🌐  Server: http://localhost:${PORT}`);
  console.log(`🔌  Socket.io ready for real-time updates`);
  console.log('💾  Database: SQLite (contest.db)');
  console.log('🚀 ============================================');
  console.log('');
});
