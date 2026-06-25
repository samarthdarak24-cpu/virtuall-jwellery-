import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get user's saved images
router.get('/images', async (req: AuthRequest, res, next) => {
    try {
        const images = await prisma.userImage.findMany({
            where: { userId: req.userId! },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ images });
    } catch (error) {
        next(error);
    }
});

const saveImageSchema = z.object({
    url: z.string().url(),
    meta: z.record(z.any()).optional(),
});

// Save image to user account
router.post('/images', async (req: AuthRequest, res, next) => {
    try {
        const data = saveImageSchema.parse(req.body);

        const image = await prisma.userImage.create({
            data: {
                url: data.url,
                userId: req.userId!,
                meta: data.meta ? JSON.stringify(data.meta) : null,
            },
        });

        res.status(201).json(image);
    } catch (error) {
        next(error);
    }
});

// Delete saved image
router.delete('/images/:id', async (req: AuthRequest, res, next) => {
    try {
        const image = await prisma.userImage.findUnique({
            where: { id: req.params.id },
        });

        if (!image || image.userId !== req.userId) {
            return res.status(404).json({ error: 'Image not found' });
        }

        await prisma.userImage.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Image deleted' });
    } catch (error) {
        next(error);
    }
});

// Get user profile including avatar details
router.get('/profile', async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId! },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                avatarType: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

const avatarSchema = z.object({
    avatarUrl: z.string().url().or(z.string().startsWith('/')),
    avatarType: z.enum(['vrm', 'glb']).optional(),
});

// Update user profile avatar details
router.put('/profile/avatar', async (req: AuthRequest, res, next) => {
    try {
        const { avatarUrl, avatarType } = avatarSchema.parse(req.body);

        const user = await prisma.user.update({
            where: { id: req.userId! },
            data: {
                avatarUrl,
                avatarType: avatarType || (avatarUrl.endsWith('.vrm') ? 'vrm' : 'glb'),
            },
        });

        res.json({
            success: true,
            avatarUrl: user.avatarUrl,
            avatarType: user.avatarType,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
