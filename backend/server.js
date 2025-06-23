import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'; // ✅ Needed for token generation
import passport from 'passport'; // ✅ Import passport
import path from 'path';
import './config/passport.js' // ✅ Import your passport strategy config
import authRoutes from './routes/authRoutes.js';
import kycRoutes from './routes/kycRoutes.js'; // ✅ Import KYC routes
import sbtRoutes from './routes/sbtRoutes.js';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // ✅ Initialize passport

// Serve images statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
app.use('/api', authRoutes);
app.use('/api/kyc', kycRoutes); // ✅ Use KYC routes
app.use('/api/sbt', sbtRoutes);

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Backend running on port ${process.env.PORT || 5000}`);
});
