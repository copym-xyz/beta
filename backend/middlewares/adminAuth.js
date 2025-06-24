import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = async(req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists and is active
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

export const optionalAuth = async(req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.userId,
                    isActive: true
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                }
            });

            if (user) {
                req.user = user;
                req.token = token;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

