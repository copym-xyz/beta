import express from 'express';
import authHandler from '../Controllers/authController.js';
import passport from 'passport';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken'; // ✅ Needed for token generation
const router = express.Router();

router.post('/signup', authHandler.signup);
router.post('/login', authHandler.login);
router.post('/logout', authHandler.logout);

// Protected route to fetch vault and wallets
router.get('/vault', authenticateToken, authHandler.getUserVault);

// Protected route to create a vault
router.post('/vault', authenticateToken, authHandler.createUserVault);

// Trigger Google login
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// Google OAuth callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    // ✅ No req.login, just issue token directly
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
  }
);
export default router;
