import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Pool } from 'pg';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true
  }
});

const pool = new Pool({
  user: 'satanwagen',
  password: '#Xar789xx',
  host: 'localhost',
  database: 'voting',
  port: 5432
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Vytvor tabuľku
pool.query(`
  CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    card_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(console.error);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('vote', async (data) => {
    console.log('Vote received:', data);
    try {
      await pool.query(
        'INSERT INTO votes (card_id, user_id) VALUES ($1, $2)',
        [data.cardId, socket.id]
      );
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM votes WHERE card_id = $1',
        [data.cardId]
      );
      io.emit('voteUpdate', { 
        cardId: data.cardId, 
        count: parseInt(result.rows[0].count)
      });
    } catch (err) {
      console.error('Vote error:', err);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK',
      database: 'PostgreSQL connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ 
      status: 'OK',
      database: 'PostgreSQL error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/votes/:cardId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM votes WHERE card_id = $1',
      [req.params.cardId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with PostgreSQL`);
});
