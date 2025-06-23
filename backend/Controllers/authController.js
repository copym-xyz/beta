import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken.js';
import { ensureVaultAndWallet } from '../utils/ensureVaultAndWallet.js'; // Ensure vault & wallet creation
const prisma = new PrismaClient();
const authHandler = {
  signup: async (req, res) => {
  const { name, email, password } = req.body;
   console.log('Request body:', req.body);
  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(user.id);
     // 🔐 Auto-create vault & wallet if not exists
    const existingVault = await prisma.vault.findFirst({ where: { userId: user.id } });
    if (!existingVault) {
      await ensureVaultAndWallet(user.id);
    }
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false, // set to true in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
        .json({ 
          user: { id: user.id, email: user.email, name: user.name },
          token: token // ✅ Also send token in response body
        });
  } catch (err) {
  console.error('Signup error:', err); // 👈 Add this
  res.status(500).json({ message: 'Signup failed' });
}
},

login: async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);
      
      // 🔐 Auto-create vault & wallet if not exists
      const existingVault = await prisma.vault.findFirst({ where: { userId: user.id } });
      if (!existingVault) {
        await ensureVaultAndWallet(user.id);
      }
      
    res
      .cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
        .json({ 
          user: { id: user.id, email: user.email, name: user.name },
          token: token // ✅ Also send token in response body
        });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
},

   getUserVault: async (req, res) => {
    try {
      const userId = req.user.id;

      const vault = await prisma.vault.findFirst({
        where: { userId },
        include: {
          wallets: true,
        },
      });

      if (!vault) {
        return res.status(404).json({ message: 'Vault not found' });
      }

      res.json(vault);
    } catch (error) {
      console.error('Error fetching vault:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  createUserVault: async (req, res) => {
    try {
      const userId = req.user.id;

      // Check if user already has a vault
      const existingVault = await prisma.vault.findFirst({
        where: { userId },
      });

      if (existingVault) {
        return res.status(400).json({ message: 'Vault already exists' });
      }

      // Create vault and wallet
      await ensureVaultAndWallet(userId);

      // Fetch the created vault with wallets
      const vault = await prisma.vault.findFirst({
        where: { userId },
        include: {
          wallets: true,
        },
      });

      res.status(201).json(vault);
    } catch (error) {
      console.error('Error creating vault:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  logout: (req, res) => {
  res.clearCookie('token').status(200).json({ message: 'Logged out' });
}
};
export default authHandler;