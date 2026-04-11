import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const tryonEventSchema = z.object({
    productId: z.string().uuid().optional(),
    mode: z.enum(['PHOTO', 'MODEL3D']),
    metadata: z.record(z.any()).optional(),
});

// Record try-on event
router.post('/events', optionalAuth, async (req: AuthRequest, res, next) => {
    try {
        const data = tryonEventSchema.parse(req.body);

        const event = await prisma.tryOnEvent.create({
            data: {
                ...data,
                userId: req.userId,
            },
        });

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

// Get try-on analytics (admin)
router.get('/analytics', async (req, res, next) => {
    try {
        const stats = await prisma.tryOnEvent.groupBy({
            by: ['mode'],
            _count: true,
        });

        const productStats = await prisma.tryOnEvent.groupBy({
            by: ['productId'],
            _count: true,
            orderBy: {
                _count: {
                    productId: 'desc',
                },
            },
            take: 10,
        });

        res.json({
            byMode: stats,
            topProducts: productStats,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
