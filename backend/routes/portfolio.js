import express from 'express';
import Portfolio from '../models/Portfolio.js';

const router = express.Router();

// Update a single asset in a user's portfolio
router.put('/:email/assets/:symbol', async (req, res) => {
  try {
    const { amount, avgPrice } = req.body;
    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    // avgPrice is optional for update
    let pf = await Portfolio.findOne({ email: req.params.email });
    if (!pf) return res.status(404).json({ error: 'Portfolio not found' });
    const idx = pf.assets.findIndex(a => a.symbol === req.params.symbol);
    if (idx === -1) return res.status(404).json({ error: 'Asset not found in portfolio' });
    pf.assets[idx].amount = amount;
    if (typeof avgPrice === 'number' && !isNaN(avgPrice)) {
      pf.assets[idx].avgPrice = avgPrice;
    }
    pf.lastUpdated = new Date();
    await pf.save();
    res.json({ message: 'Asset updated', asset: pf.assets[idx], lastUpdated: pf.lastUpdated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get portfolio by email
router.get('/:email', async (req, res) => {
  try {
    const pf = await Portfolio.findOne({ email: req.params.email });
    res.json(pf || { email: req.params.email, assets: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all portfolios
router.get('/', async (req, res) => {
  try {
    const portfolios = await Portfolio.find({});
    res.json(portfolios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create portfolio
router.post('/', async (req, res) => {
  try {
    const { email, assets } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    const existing = await Portfolio.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Portfolio already exists' });
    // Sanitize assets
    const safeAssets = Array.isArray(assets) ? assets.map(a => ({
      symbol: a.symbol,
      amount: (typeof a.amount === 'number' && !isNaN(a.amount) && a.amount >= 0) ? a.amount : 0,
      avgPrice: (typeof a.avgPrice === 'number' && !isNaN(a.avgPrice)) ? a.avgPrice : 0
    })) : [];
    const pf = new Portfolio({ email, assets: safeAssets });
    await pf.save();
    res.json({ message: 'Portfolio created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update portfolio by email
router.put('/:email', async (req, res) => {
  try {
    const { assets } = req.body;
    const pf = await Portfolio.findOneAndUpdate(
      { email: req.params.email },
      { $set: { assets } },
      { new: true }
    );
    if (!pf) return res.status(404).json({ error: 'Portfolio not found' });
    res.json(pf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete portfolio by email
router.delete('/:email', async (req, res) => {
  try {
    const result = await Portfolio.deleteOne({ email: req.params.email });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Portfolio not found' });
    res.json({ message: 'Portfolio deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add asset to portfolio
router.post('/:email/assets', async (req, res) => {
  try {
    console.log('POST /:email/assets called:', req.params.email, req.body);
    const { symbol, amount, avgPrice } = req.body;
    console.log('ADMIN ADD ASSET:', req.params.email, symbol, amount, avgPrice);
    console.log('typeof amount:', typeof amount, amount);
    if (!symbol) return res.status(400).json({ error: 'Missing asset symbol' });
    const amt = parseFloat(amount);
    const avgP = parseFloat(avgPrice);
    if (isNaN(amt) || amt < 0) return res.status(400).json({ error: 'Invalid amount' });
    if (isNaN(avgP)) return res.status(400).json({ error: 'Invalid avgPrice' });
    let pf = await Portfolio.findOne({ email: req.params.email });
    if (!pf) {
      // Auto-create portfolio if not found
      pf = new Portfolio({ email: req.params.email, assets: [] });
    }
    // Add or update asset
    const idx = pf.assets.findIndex(a => a.symbol === symbol);
    if (idx >= 0) {
      if (typeof pf.assets[idx].amount !== 'number' || isNaN(pf.assets[idx].amount)) {
        pf.assets[idx].amount = 0;
      }
      pf.assets[idx].amount += amt;
      pf.assets[idx].avgPrice = avgPrice;
    } else {
      pf.assets.push({ symbol, amount: amt, avgPrice });
    }
    pf.lastUpdated = new Date();
    await pf.save();
    console.log('PORTFOLIO AFTER SAVE:', pf);
    res.json({ message: 'Asset added', items: pf.assets, lastUpdated: pf.lastUpdated });
  } catch (err) {
    console.error('Error in POST /:email/assets:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update portfolio (replace assets)
router.post('/:email', async (req, res) => {
  try {
    const { assets } = req.body;
    // Sanitize assets
    const safeAssets = Array.isArray(assets) ? assets.map(a => ({
      symbol: a.symbol,
      amount: (typeof a.amount === 'number' && !isNaN(a.amount) && a.amount >= 0) ? a.amount : 0,
      avgPrice: (typeof a.avgPrice === 'number' && !isNaN(a.avgPrice)) ? a.avgPrice : 0
    })) : [];
    let pf = await Portfolio.findOne({ email: req.params.email });
    if (!pf) pf = new Portfolio({ email: req.params.email, assets: safeAssets });
    else pf.assets = safeAssets;
    await pf.save();
    res.json({ message: 'Portfolio updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
