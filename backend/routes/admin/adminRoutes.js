import express from 'express';
import apiController from '../../Controllers/adminController.js';
import { authenticateToken } from '../../middlewares/adminAuth.js';
import { validateSignUp, validateSignIn } from '../../middlewares/adminValidation.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Public routes
router.post('/signup', validateSignUp, apiController.signUp);
router.post('/signin', validateSignIn, apiController.signIn);
router.get('/health', apiController.healthCheck);

// Protected routes
router.post('/signout', authenticateToken, apiController.signOut);
router.post('/signout-all', authenticateToken, apiController.signOutAll);
router.get('/profile', authenticateToken, apiController.getProfile);
router.put('/profile', authenticateToken, apiController.updateProfile);

// Get all clients
router.get('/clients', authenticateToken, async(req, res) => {
    try {
        const clients = await prisma.client.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: clients
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clients',
            error: error.message
        });
    }
});

// Get client by ID
router.get('/clients/:id', authenticateToken, async(req, res) => {
    try {
        const client = await prisma.client.findUnique({
            where: {
                id: parseInt(req.params.id)
            }
        });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.json({
            success: true,
            data: client
        });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch client',
            error: error.message
        });
    }
});

// Create new client
router.post('/clients', authenticateToken, async(req, res) => {
    try {
        const {
            clientId,
            email,
            firstName,
            lastName,
            country,
            tradingStatus,
            manager,
            balance,
            clientType
        } = req.body;

        const client = await prisma.client.create({
            data: {
                clientId,
                email,
                firstName,
                lastName,
                country,
                tradingStatus,
                manager,
                balance: parseFloat(balance) || 0,
                clientType
            }
        });

        res.status(201).json({
            success: true,
            data: client,
            message: 'Client created successfully'
        });
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create client',
            error: error.message
        });
    }
});

// Update client
router.put('/clients/:id', authenticateToken, async(req, res) => {
    try {
        const {
            email,
            firstName,
            lastName,
            country,
            isVerified,
            tradingStatus,
            manager,
            balance,
            clientType
        } = req.body;

        const client = await prisma.client.update({
            where: {
                id: parseInt(req.params.id)
            },
            data: {
                email,
                firstName,
                lastName,
                country,
                isVerified,
                tradingStatus,
                manager,
                balance: parseFloat(balance),
                clientType
            }
        });

        res.json({
            success: true,
            data: client,
            message: 'Client updated successfully'
        });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update client',
            error: error.message
        });
    }
});

// Delete client
router.delete('/clients/:id', authenticateToken, async(req, res) => {
    try {
        await prisma.client.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        res.json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete client',
            error: error.message
        });
    }
});

// Get client statistics
router.get('/clients/stats/overview', authenticateToken, async(req, res) => {
    try {
        const totalClients = await prisma.client.count();
        const verifiedClients = await prisma.client.count({
            where: { isVerified: true }
        });
        const activeClients = await prisma.client.count({
            where: { tradingStatus: 'Active' }
        });
        const individualClients = await prisma.client.count({
            where: { clientType: 'Individual' }
        });
        const communityClients = await prisma.client.count({
            where: { clientType: 'Community' }
        });

        const totalBalance = await prisma.client.aggregate({
            _sum: {
                balance: true
            }
        });

        res.json({
            success: true,
            data: {
                totalClients,
                verifiedClients,
                activeClients,
                individualClients,
                communityClients,
                totalBalance: totalBalance._sum.balance || 0,
                verificationRate: Math.round((verifiedClients / totalClients) * 100)
            }
        });
    } catch (error) {
        console.error('Error fetching client statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

// LEADS ENDPOINTS

// Get all leads
router.get('/leads', authenticateToken, async(req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            where: {
                convertedToClientId: null // Only show unconverted leads
            },
            orderBy: {
                score: 'desc'
            }
        });

        res.json({
            success: true,
            data: leads
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leads',
            error: error.message
        });
    }
});

// Create new lead
router.post('/leads', authenticateToken, async(req, res) => {
    try {
        const {
            leadId,
            email,
            firstName,
            lastName,
            country,
            status,
            source,
            score,
            estimatedValue,
            clientType,
            notes
        } = req.body;

        const lead = await prisma.lead.create({
            data: {
                leadId,
                email,
                firstName,
                lastName,
                country,
                status,
                source,
                score: parseInt(score) || 0,
                estimatedValue: parseFloat(estimatedValue) || 0,
                clientType,
                notes
            }
        });

        res.status(201).json({
            success: true,
            data: lead,
            message: 'Lead created successfully'
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create lead',
            error: error.message
        });
    }
});

// Convert lead to client
router.post('/leads/:id/convert', authenticateToken, async(req, res) => {
    try {
        const leadId = parseInt(req.params.id);
        const { manager, initialBalance, tradingStatus } = req.body;

        // Get the lead
        const lead = await prisma.lead.findUnique({
            where: { id: leadId }
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: 'Lead not found'
            });
        }

        if (lead.convertedToClientId) {
            return res.status(400).json({
                success: false,
                message: 'Lead has already been converted'
            });
        }

        // Generate unique client ID
        const clientCount = await prisma.client.count();
        const clientId = `CL${String(clientCount + 1).padStart(3, '0')}`;

        // Create client from lead
        const client = await prisma.client.create({
            data: {
                clientId,
                email: lead.email,
                firstName: lead.firstName,
                lastName: lead.lastName,
                country: lead.country,
                tradingStatus: tradingStatus || 'Pending',
                manager: manager || 'Unassigned',
                balance: parseFloat(initialBalance) || 0,
                clientType: lead.clientType
            }
        });

        // Mark lead as converted
        await prisma.lead.update({
            where: { id: leadId },
            data: { convertedToClientId: client.id }
        });

        res.json({
            success: true,
            data: { lead, client },
            message: 'Lead converted to client successfully'
        });
    } catch (error) {
        console.error('Error converting lead:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to convert lead',
            error: error.message
        });
    }
});

// Get lead statistics
router.get('/leads/stats/overview', authenticateToken, async(req, res) => {
    try {
        const totalLeads = await prisma.lead.count({
            where: { convertedToClientId: null }
        });
        const hotLeads = await prisma.lead.count({
            where: { status: 'Hot', convertedToClientId: null }
        });
        const warmLeads = await prisma.lead.count({
            where: { status: 'Warm', convertedToClientId: null }
        });
        const coldLeads = await prisma.lead.count({
            where: { status: 'Cold', convertedToClientId: null }
        });

        const totalEstimatedValue = await prisma.lead.aggregate({
            where: { convertedToClientId: null },
            _sum: { estimatedValue: true }
        });

        const convertedLeads = await prisma.lead.count({
            where: { convertedToClientId: { not: null } }
        });

        const totalLeadsEver = await prisma.lead.count();
        const conversionRate = totalLeadsEver > 0 ? Math.round((convertedLeads / totalLeadsEver) * 100) : 0;

        res.json({
            success: true,
            data: {
                totalLeads,
                hotLeads,
                warmLeads,
                coldLeads,
                totalEstimatedValue: totalEstimatedValue._sum.estimatedValue || 0,
                convertedLeads,
                conversionRate
            }
        });
    } catch (error) {
        console.error('Error fetching lead statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lead statistics',
            error: error.message
        });
    }
});

export default router;