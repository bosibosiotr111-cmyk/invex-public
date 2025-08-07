import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
symbol: String,
amount: {
  type: Number,
  required: true,
  min: [0, 'Amount must be non-negative']
},
avgPrice: {
  type: Number,
  default: 0
}
});

const PortfolioSchema = new mongoose.Schema({
  email: { type: String, required: true },
  assets: [AssetSchema]
});

export default mongoose.model('Portfolio', PortfolioSchema);
