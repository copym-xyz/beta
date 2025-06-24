import { PrismaClient } from '@prisma/client';
import authService from '../services/adminAuthService.js'

const prisma = new PrismaClient();

class ApiController {
    // Sign Up
    async signUp(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Check if user already exists
            const existingUser = await prisma.users.findUnique({
                where: { email }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password
            const hashedPassword = await authService.hashPassword(password);

            // Create user
            const user = await prisma.users.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName: firstName || null,
                    lastName: lastName || null
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true
                }
            });

            // Generate token
            const token = authService.generateToken(user.id);

            // Create refresh token
            await authService.createRefreshToken(user.id, token);

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            console.error('SignUp error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Admin Sign In - Only for Admin Dashboard Access
    async signIn(req, res) {
        try {
            const { email, password, rememberMe } = req.body;

            // Find user with role
            const user = await prisma.users.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    firstName: true,
                    lastName: true,
                    userType: true,
                    isActive: true,
                    createdAt: true
                }
            });

            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials or account not found'
                });
            }

            // Check if user is ADMIN (Admin Dashboard Access Only)
            if (user.userType !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required for dashboard access.'
                });
            }

            // Check password
            const isPasswordValid = await authService.comparePassword(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials or account not found'
                });
            }

            // Generate token with longer expiration for admins
            const tokenExpiration = rememberMe ? "30d" : "24h";
            const token = authService.generateToken(user.id, tokenExpiration);

            // Create refresh token
            await authService.createRefreshToken(user.id, token);

            // Return admin user data without password
            const userData = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                userType: user.userType,
                role: 'Admin',
                createdAt: user.createdAt
            };

            res.json({
                success: true,
                message: 'Admin authentication successful - Welcome to Dashboard',
                data: {
                    user: userData,
                    token,
                    dashboardAccess: true
                }
            });
        } catch (error) {
            console.error('Admin SignIn error:', error);
            res.status(500).json({
                success: false,
                message: 'Authentication service temporarily unavailable'
            });
        }
    }

    // Sign Out
    async signOut(req, res) {
        try {
            const { token } = req;

            await authService.deleteRefreshToken(token);

            res.json({
                success: true,
                message: 'Signed out successfully'
            });
        } catch (error) {
            console.error('SignOut error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Get Profile
    async getProfile(req, res) {
        try {
            const user = req.user;

            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            console.error('GetProfile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Update Profile
    async updateProfile(req, res) {
        try {
            const { firstName, lastName } = req.body;
            const userId = req.user.id;

            const updatedUser = await prisma.users.update({
                where: { id: userId },
                data: {
                    firstName: firstName || null,
                    lastName: lastName || null
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    updatedAt: true
                }
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            console.error('UpdateProfile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // Health Check
    async healthCheck(req, res) {
        try {
            // Test database connection
            await prisma.$queryRaw `SELECT 1`;

            res.json({
                success: true,
                message: 'Server is running',
                timestamp: new Date().toISOString(),
                database: 'Connected'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: error.message
            });
        }
    }

    // Sign Out All (logout from all devices)
    async signOutAll(req, res) {
        try {
            const userId = req.user.id;

            await authService.deleteAllUserRefreshTokens(userId);

            res.json({
                success: true,
                message: 'Signed out from all devices successfully'
            });
        } catch (error) {
            console.error('SignOutAll error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
const apiController = new ApiController();
export default apiController