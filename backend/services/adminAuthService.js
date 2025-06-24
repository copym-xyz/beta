import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

class AuthService {
    // Generate JWT access token
    generateToken(userId, expiresIn = null) {
        const expiration = expiresIn || process.env.JWT_EXPIRES_IN;
        return jwt.sign({ userId },
            process.env.JWT_SECRET, { expiresIn: expiration }
        );
    }

    // Generate JWT refresh token
    generateRefreshToken(userId) {
        return jwt.sign({ userId },
            process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );
    }

    // Hash password
    async hashPassword(password) {
        const saltRounds = 12;
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare password
    async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    // Create refresh token in database
    async createRefreshToken(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        return await prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt
            }
        });
    }

    // Delete refresh token
    async deleteRefreshToken(token) {
        try {
            return await prisma.refreshToken.delete({
                where: { token }
            });
        } catch (error) {
            // Token might not exist, that's ok
            console.log('Token not found for deletion:', error.message);
            return null;
        }
    }

    // Delete all user refresh tokens
    async deleteAllUserRefreshTokens(userId) {
        return await prisma.refreshToken.deleteMany({
            where: { userId }
        });
    }

    // Clean expired refresh tokens
    async cleanExpiredRefreshTokens() {
        return await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
    }

    // Verify refresh token
    async verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

            const refreshToken = await prisma.refreshToken.findUnique({
                where: { token },
                include: { user: true }
            });

            if (!refreshToken || refreshToken.expiresAt < new Date()) {
                return null;
            }

            return refreshToken;
        } catch (error) {
            return null;
        }
    }
}

const authService = new AuthService();
export default authService;