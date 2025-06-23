import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import {ensureVaultAndWallet} from '../utils/ensureVaultAndWallet.js';

dotenv.config();
const prisma = new PrismaClient();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      // Step 1: Find or create user
      let user = await prisma.users.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.users.create({
          data: {
            name: profile.displayName,
            email,
            password: '', // or "GOOGLE_OAUTH_NO_PASSWORD"
            provider: 'google',
          },
        });
      }

      // ✅ Step 2: Ensure vault/wallet exists immediately
      const existingVault = await prisma.vault.findFirst({
        where: { userId: user.id },
      });

      if (!existingVault) {
        await ensureVaultAndWallet(user.id);
      }

      return done(null, user);
    } catch (err) {
      console.error('Passport Google Strategy Error:', err);
      return done(err, null);
    }
  }
));

export default passport;
