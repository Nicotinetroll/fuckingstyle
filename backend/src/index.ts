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
const activeUsers = new Map();
const userIdentities = new Map();

const adjectives = [
  'Angry', 'Happy', 'Sleepy', 'Bouncy', 'Grumpy', 'Fluffy', 'Sparkly', 'Dizzy', 'Sneaky', 'Giggly',
  'Wobbly', 'Fuzzy', 'Chunky', 'Sassy', 'Cranky', 'Bubbly', 'Wiggly', 'Quirky', 'Nerdy', 'Silly',
  'Clumsy', 'Mighty', 'Tiny', 'Giant', 'Flying', 'Dancing', 'Singing', 'Jumping', 'Running', 'Sleeping',
  'Confused', 'Excited', 'Brave', 'Shy', 'Wild', 'Calm', 'Crazy', 'Lazy', 'Hyper', 'Chill',
  'Magical', 'Mystical', 'Epic', 'Legendary', 'Cosmic', 'Galactic', 'Quantum', 'Atomic', 'Electric', 'Turbo'
];

const nouns = [
  'Cat', 'Dog', 'Panda', 'Koala', 'Tiger', 'Lion', 'Bear', 'Wolf', 'Fox', 'Rabbit',
  'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Pegasus', 'Hydra', 'Kraken', 'Yeti', 'Goblin', 'Troll',
  'Ninja', 'Pirate', 'Viking', 'Knight', 'Samurai', 'Wizard', 'Witch', 'Mage', 'Warrior', 'Archer',
  'Potato', 'Banana', 'Apple', 'Orange', 'Mango', 'Avocado', 'Tomato', 'Carrot', 'Broccoli', 'Pizza',
  'Taco', 'Burger', 'Sushi', 'Noodle', 'Cookie', 'Donut', 'Cake', 'Pie', 'Waffle', 'Pancake',
  'Robot', 'Cyborg', 'Android', 'Machine', 'Computer', 'Laptop', 'Phone', 'Tablet', 'Console', 'Gadget'
];

function generateUniqueName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

function generateUserId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        card_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255),
        user_identity VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_identities (
        user_id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(7) NOT NULL,
        sol_address VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  } catch (err) {}
}

initDatabase();

io.on('connection', (socket) => {
  socket.on('identify', async (data) => {
    let userId = data.userId;
    let userName, userColor, solAddress;
    
    if (userId && userIdentities.has(userId)) {
      const identity = userIdentities.get(userId);
      userName = identity.name;
      userColor = identity.color;
      solAddress = identity.solAddress;
    } else {
      userId = generateUserId();
      userName = generateUniqueName();
      userColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      solAddress = data.solAddress || null;
      
      userIdentities.set(userId, {
        name: userName,
        color: userColor,
        solAddress: solAddress
      });
      
      try {
        await pool.query(
          'INSERT INTO user_identities (user_id, name, color, sol_address) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING',
          [userId, userName, userColor, solAddress]
        );
      } catch (err) {}
    }
    
    activeUsers.set(socket.id, { 
      id: socket.id,
      userId: userId,
      name: userName, 
      color: userColor,
      x: 50,
      y: 50,
      message: '',
      isTyping: false,
      solAddress: solAddress
    });
    
    socket.emit('identity', {
      userId: userId,
      name: userName,
      color: userColor,
      solAddress: solAddress
    });
    
    socket.emit('users', Array.from(activeUsers.values()));
    socket.broadcast.emit('userJoined', activeUsers.get(socket.id));
  });
  
  socket.on('cursorMove', (data) => {
    const user = activeUsers.get(socket.id);
    if (user && typeof data.x === 'number' && typeof data.y === 'number') {
      user.x = Math.max(0, Math.min(100, data.x));
      user.y = Math.max(0, Math.min(100, data.y));
      
      socket.broadcast.emit('cursorUpdate', {
        id: socket.id,
        x: user.x,
        y: user.y,
        name: user.name,
        color: user.color,
        message: user.message,
        isTyping: user.isTyping
      });
    }
  });
  
  socket.on('userTyping', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.message = data.message || '';
      user.isTyping = data.isTyping || false;
      
      socket.broadcast.emit('userTypingUpdate', {
        id: socket.id,
        message: user.message,
        isTyping: user.isTyping
      });
    }
  });
  
  socket.on('updateSolAddress', async (data) => {
    const user = activeUsers.get(socket.id);
    if (user && data.address) {
      user.solAddress = data.address;
      
      if (userIdentities.has(user.userId)) {
        userIdentities.get(user.userId).solAddress = data.address;
      }
      
      try {
        await pool.query(
          'UPDATE user_identities SET sol_address = $1 WHERE user_id = $2',
          [data.address, user.userId]
        );
        socket.emit('solAddressUpdated', { success: true });
      } catch (err) {
        socket.emit('solAddressUpdated', { success: false });
      }
    }
  });
  
  socket.on('vote', async (data) => {
    const user = activeUsers.get(socket.id);
    if (!user) {
      return;
    }
    
    try {
      await pool.query(
        'INSERT INTO votes (card_id, user_id, user_identity) VALUES ($1, $2, $3)',
        [data.cardId, socket.id, user.userId]
      );
      
      const result = await pool.query(
        'SELECT COUNT(*) as count FROM votes WHERE card_id = $1',
        [data.cardId]
      );
      
      io.emit('voteUpdate', { 
        cardId: data.cardId, 
        count: parseInt(result.rows[0].count),
        voter: user.name
      });
      
      socket.emit('voteSuccess');
      
    } catch (err) {
      socket.emit('voteError', { message: 'Failed to record vote' });
    }
  });
  
  socket.on('disconnect', () => {
    activeUsers.delete(socket.id);
    socket.broadcast.emit('userLeft', socket.id);
  });
});

async function loadUserIdentities() {
  try {
    const result = await pool.query('SELECT * FROM user_identities');
    result.rows.forEach(row => {
      userIdentities.set(row.user_id, {
        name: row.name,
        color: row.color,
        solAddress: row.sol_address
      });
    });
  } catch (err) {}
}

loadUserIdentities();

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK',
      database: 'PostgreSQL connected',
      activeUsers: activeUsers.size,
      totalUsers: userIdentities.size,
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

app.post('/api/admin/reset', async (req, res) => {
  const { password } = req.body;
  
  if (password !== 'fukd-reset-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await pool.query('DELETE FROM votes');
    
    io.emit('votesReset', { message: 'All votes have been reset' });
    
    res.json({ 
      success: true, 
      message: 'All votes deleted successfully' 
    });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: 'Failed to reset votes' });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const votesResult = await pool.query('SELECT COUNT(*) as total FROM votes');
    const usersResult = await pool.query('SELECT COUNT(*) as total FROM user_identities');
    const topCardsResult = await pool.query(`
      SELECT card_id, COUNT(*) as votes 
      FROM votes 
      GROUP BY card_id 
      ORDER BY votes DESC 
      LIMIT 5
    `);
    
    res.json({
      totalVotes: votesResult.rows[0].total,
      totalUsers: usersResult.rows[0].total,
      topCards: topCardsResult.rows,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.post('/api/admin/reset-users', async (req, res) => {
  const { password } = req.body;
  
  if (password !== 'fukd-reset-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await pool.query('DELETE FROM votes');
    await pool.query('DELETE FROM user_identities');
    
    userIdentities.clear();
    
    io.emit('fullReset', { message: 'All data has been reset' });
    
    res.json({ 
      success: true, 
      message: 'All votes and users deleted successfully' 
    });
  } catch (err) {
    console.error('Full reset error:', err);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin endpoints:
  - GET  /api/admin/stats - Get voting statistics
  - POST /api/admin/reset - Reset votes only (password: fukd-reset-2024)
  - POST /api/admin/reset-users - Reset everything (password: fukd-reset-2024)`);
});