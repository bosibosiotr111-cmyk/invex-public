import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cookieParser from 'cookie-parser';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret'; // Change to env var in production

// Get currently logged-in client (for admin panel)
router.get('/current-client', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json(null);
  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ email: user.email, role: user.role });
  } catch {
    res.json(null);
  }
});

// Auth middleware: checks JWT in cookie
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
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    user.lastLogin = new Date();
    await user.save();
    // Set JWT in HTTP-only cookie
    // Set cookie options based on environment (dev vs prod)
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
    const cookieOptions = {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      domain: 'localhost'
    };
    if (isLocalhost) {
      cookieOptions.sameSite = 'lax';
      cookieOptions.secure = false;
    } else {
      cookieOptions.sameSite = 'None';
      cookieOptions.secure = true;
    }
    res.cookie('token', token, cookieOptions);
    res.json({ user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout: clear the cookie
router.post('/logout', (req, res) => {
  // Clear cookie with same options as set
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const clearOptions = {
    httpOnly: true,
    path: '/',
    domain: 'localhost'
  };
  if (isLocalhost) {
    clearOptions.sameSite = 'lax';
    clearOptions.secure = false;
  } else {
    clearOptions.sameSite = 'None';
    clearOptions.secure = true;
  }
  res.clearCookie('token', clearOptions);
  res.json({ success: true });
});

// Get current user from cookie
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }, '-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by email
router.get('/:email', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== req.params.email) return res.status(403).json({ error: 'Forbidden' });
    const user = await User.findOne({ email: req.params.email }, '-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user by email
router.put('/:email', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== req.params.email) return res.status(403).json({ error: 'Forbidden' });
    const { name, role } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: { name, role } },
      { new: true, projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user by email
router.delete('/:email', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== req.params.email) return res.status(403).json({ error: 'Forbidden' });
    const result = await User.deleteOne({ email: req.params.email });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
