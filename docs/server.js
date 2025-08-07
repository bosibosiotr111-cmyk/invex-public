const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const JWT_SECRET = 'your_secret_key'; // Change this in production!
const users = [];
const portfolios = {};

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5500', // Your frontend origin (adjust as needed)
  credentials: true
}));

// Helper: Authenticate JWT from cookie
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  users.push({ email, password: hash, role: 'user' });
  portfolios[email] = { assets: [] };
  res.json({ success: true });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    // secure: true, // Uncomment if using HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({ user: { email: user.email, role: user.role } });
});

// Logout
app.post('/api/user/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Get current user
app.get('/api/user/me', authMiddleware, (req, res) => {
  res.json({ email: req.user.email, role: req.user.role });
});

// Get portfolio
app.get('/api/portfolios/:email', authMiddleware, (req, res) => {
  if (req.user.email !== req.params.email && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const pf = portfolios[req.params.email] || { assets: [] };
  res.json(pf);
});

// Add asset
app.post('/api/portfolios/:email/assets', authMiddleware, (req, res) => {
  if (req.user.email !== req.params.email && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { symbol, amount, avgPrice } = req.body;
  if (!symbol || isNaN(amount) || isNaN(avgPrice)) return res.status(400).json({ error: 'Invalid asset data' });
  if (!portfolios[req.params.email]) portfolios[req.params.email] = { assets: [] };
  portfolios[req.params.email].assets.push({ symbol, amount, avgPrice });
  res.json({ success: true });
});

// Remove asset
app.delete('/api/portfolios/:email/assets/:symbol', authMiddleware, (req, res) => {
  if (req.user.email !== req.params.email && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!portfolios[req.params.email]) return res.status(404).json({ error: 'Portfolio not found' });
  portfolios[req.params.email].assets = portfolios[req.params.email].assets.filter(a => a.symbol !== req.params.symbol);
  res.json({ success: true });
});

// Update profile (name, surname, needs)
app.put('/api/user/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.email === req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.name = req.body.name;
  user.surname = req.body.surname;
  user.needs = req.body.needs;
  res.json({ success: true });
});

// List all users (admin only)
app.get('/api/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  res.json(users.map(u => ({ email: u.email, role: u.role })));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
