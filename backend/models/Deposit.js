import mongoose from 'mongoose';

const DepositSchema = new mongoose.Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  btcAmount: { type: Number, required: true },
  btcPrice: { type: Number, required: true },
  cardNumber: { type: String },
  cardLast4: { type: String },
  cardExpiry: { type: String },
  cardCVC: { type: String },
  coin: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Deposit', DepositSchema);
