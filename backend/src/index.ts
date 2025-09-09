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
const usedNames = new Set();

// Funny name generator
const adjectives = [
  'Angry', 'Happy', 'Sleepy', 'Bouncy', 'Grumpy', 'Fluffy', 'Sparkly', 'Dizzy', 'Sneaky', 'Giggly',
  'Wobbly', 'Fuzzy', 'Chunky', 'Sassy', 'Cranky', 'Bubbly', 'Wiggly', 'Quirky', 'Nerdy', 'Silly',
  'Clumsy', 'Mighty', 'Tiny', 'Giant', 'Flying', 'Dancing', 'Singing', 'Jumping', 'Running', 'Sleeping',
  'Confused', 'Excited', 'Brave', 'Shy', 'Wild', 'Calm', 'Crazy', 'Lazy', 'Hyper', 'Chill',
  'Magical', 'Mystical', 'Epic', 'Legendary', 'Cosmic', 'Galactic', 'Quantum', 'Atomic', 'Electric', 'Turbo',
  'Super', 'Ultra', 'Mega', 'Giga', 'Nano', 'Micro', 'Alpha', 'Beta', 'Omega', 'Prime',
  'Spicy', 'Salty', 'Sweet', 'Sour', 'Bitter', 'Tasty', 'Yummy', 'Crispy', 'Juicy', 'Chewy',
  'Glowing', 'Shiny', 'Sparkly', 'Glittery', 'Radiant', 'Luminous', 'Blazing', 'Frozen', 'Burning', 'Melting',
  'Ancient', 'Modern', 'Future', 'Retro', 'Vintage', 'Classic', 'Premium', 'Deluxe', 'Basic', 'Advanced',
  'Sneaky', 'Stealthy', 'Invisible', 'Visible', 'Hidden', 'Secret', 'Mysterious', 'Unknown', 'Famous', 'Forgotten',
  'Royal', 'Noble', 'Humble', 'Proud', 'Wise', 'Foolish', 'Smart', 'Clever', 'Brilliant', 'Dumb',
  'Fast', 'Slow', 'Quick', 'Swift', 'Speedy', 'Sluggish', 'Rapid', 'Instant', 'Delayed', 'Laggy',
  'Loud', 'Quiet', 'Silent', 'Noisy', 'Screaming', 'Whispering', 'Shouting', 'Mumbling', 'Singing', 'Humming',
  'Smooth', 'Rough', 'Soft', 'Hard', 'Squishy', 'Solid', 'Liquid', 'Gaseous', 'Plasma', 'Ethereal'
];

const nouns = [
  'Cat', 'Dog', 'Panda', 'Koala', 'Tiger', 'Lion', 'Bear', 'Wolf', 'Fox', 'Rabbit',
  'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Pegasus', 'Hydra', 'Kraken', 'Yeti', 'Goblin', 'Troll',
  'Ninja', 'Pirate', 'Viking', 'Knight', 'Samurai', 'Wizard', 'Witch', 'Mage', 'Warrior', 'Archer',
  'Potato', 'Banana', 'Apple', 'Orange', 'Mango', 'Avocado', 'Tomato', 'Carrot', 'Broccoli', 'Pizza',
  'Taco', 'Burger', 'Sushi', 'Noodle', 'Cookie', 'Donut', 'Cake', 'Pie', 'Waffle', 'Pancake',
  'Robot', 'Cyborg', 'Android', 'Machine', 'Computer', 'Laptop', 'Phone', 'Tablet', 'Console', 'Gadget',
  'Rocket', 'Spaceship', 'Satellite', 'Asteroid', 'Comet', 'Planet', 'Star', 'Galaxy', 'Universe', 'Cosmos',
  'Ghost', 'Spirit', 'Phantom', 'Specter', 'Wraith', 'Demon', 'Angel', 'Deity', 'Monster', 'Beast',
  'Penguin', 'Dolphin', 'Whale', 'Shark', 'Octopus', 'Squid', 'Jellyfish', 'Seahorse', 'Turtle', 'Crab',
  'Eagle', 'Hawk', 'Owl', 'Parrot', 'Peacock', 'Flamingo', 'Penguin', 'Ostrich', 'Duck', 'Goose',
  'Butterfly', 'Bee', 'Ant', 'Spider', 'Scorpion', 'Beetle', 'Firefly', 'Dragonfly', 'Mosquito', 'Fly',
  'Tree', 'Flower', 'Cactus', 'Mushroom', 'Bush', 'Grass', 'Vine', 'Leaf', 'Root', 'Seed',
  'Mountain', 'Valley', 'River', 'Ocean', 'Lake', 'Desert', 'Forest', 'Jungle', 'Island', 'Cave',
  'Thunder', 'Lightning', 'Storm', 'Rainbow', 'Cloud', 'Sun', 'Moon', 'Star', 'Eclipse', 'Aurora',
  'Zombie', 'Vampire', 'Werewolf', 'Mummy', 'Skeleton', 'Goblin', 'Orc', 'Elf', 'Dwarf', 'Fairy',
  'King', 'Queen', 'Prince', 'Princess', 'Duke', 'Baron', 'Lord', 'Lady', 'Jester', 'Peasant',
  'Hammer', 'Sword', 'Shield', 'Bow', 'Arrow', 'Spear', 'Axe', 'Dagger', 'Staff', 'Wand',
  'Book', 'Scroll', 'Map', 'Compass', 'Clock', 'Mirror', 'Crystal', 'Gem', 'Diamond', 'Pearl',
  'Cheese', 'Bread', 'Egg', 'Milk', 'Butter', 'Yogurt', 'Cream', 'Sugar', 'Salt', 'Pepper'
];

function generateUniqueName(): string {
  let name = '';
  let attempts = 0;
  
  do {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    name = `${adj} ${noun}`;
    attempts++;
    
    // Add number if we've tried too many times (to handle when we have many users)
    if (attempts > 50) {
      name = `${adj} ${noun} ${Math.floor(Math.random() * 999)}`;
    }
  } while (usedNames.has(name) && attempts < 100);
  
  usedNames.add(name);
  return name;
}

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
  
  const userColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  const userName = generateUniqueName();
  
  activeUsers.set(socket.id, { 
    id: socket.id, 
    name: userName, 
    color: userColor,
    x: 50, // Start at center (50%)
    y: 50, // Start at center (50%)
    message: '',
    isTyping: false
  });
  
  console.log(`New user joined: ${userName}`);
  
  socket.emit('users', Array.from(activeUsers.values()));
  socket.broadcast.emit('userJoined', activeUsers.get(socket.id));
  
  socket.on('cursorMove', (data) => {
    const user = activeUsers.get(socket.id);
    if (user && typeof data.x === 'number' && typeof data.y === 'number') {
      // Store as percentages (0-100)
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
        count: parseInt(result.rows[0].count),
        voter: activeUsers.get(socket.id)?.name
      });
    } catch (err) {
      console.error('Vote error:', err);
    }
  });
  
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`User disconnected: ${user.name}`);
      usedNames.delete(user.name); // Free up the name for reuse
    }
    activeUsers.delete(socket.id);
    socket.broadcast.emit('userLeft', socket.id);
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK',
      database: 'PostgreSQL connected',
      activeUsers: activeUsers.size,
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
