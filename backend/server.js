
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user.js';
import portfolioRoutes from './routes/portfolio.js';
import depositRoutes from './routes/deposit.js';


const app = express();
dotenv.config();
// Set CORS to allow credentials and correct origin, including GitHub Pages
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:8000',
    'https://bosibosiotr111-cmyk.github.io',
    'https://bosibosiotr111-cmyk.github.io/invex-public'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB connection

// Enable Mongoose debug mode to log all queries
mongoose.set('debug', true);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error:', err));

// API routes

app.use('/api/users', userRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/deposits', depositRoutes);

app.get('/', (req, res) => res.send('INVEX backend running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
