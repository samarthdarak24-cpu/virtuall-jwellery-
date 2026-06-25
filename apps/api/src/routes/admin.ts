import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// All admin routes require authentication
router.use(authenticate);

const createProductSchema = z.object({
    sku: z.string(),
    title: z.string(),
    description: z.string().optional(),
    priceCents: z.number().int().positive(),
});

// Create product
router.post('/products', async (req: AuthRequest, res, next) => {
    try {
        const data = createProductSchema.parse(req.body);

        const product = await prisma.product.create({
            data,
            include: {
                assets: true,
            },
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
});

// Update product
router.patch('/products/:id', async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;
        const data = createProductSchema.partial().parse(req.body);

        const product = await prisma.product.update({
            where: { id },
            data,
            include: {
                assets: true,
            },
        });

        res.json(product);
    } catch (error) {
        next(error);
    }
});

// Delete product
router.delete('/products/:id', async (req: AuthRequest, res, next) => {
    try {
        await prisma.product.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
});

// Publish/unpublish product
router.patch('/products/:id/publish', async (req: AuthRequest, res, next) => {
    try {
        const { published } = req.body;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: { published: Boolean(published) },
        });

        res.json(product);
    } catch (error) {
        next(error);
    }
});

const createAssetSchema = z.object({
    type: z.enum(['IMAGE_2D', 'MODEL_GLTF', 'PBR_BASECOLOR', 'PBR_NORMAL', 'PBR_METALROUGH', 'HDRI']),
    url: z.string().url(),
    metadata: z.record(z.any()).optional(),
});

// Add asset to product
router.post('/products/:id/assets', async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;
        const data = createAssetSchema.parse(req.body);

        const asset = await prisma.productAsset.create({
            data: {
                productId: id,
                type: data.type,
                url: data.url,
                metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            },
        });

        res.status(201).json(asset);
    } catch (error) {
        next(error);
    }
});

// Delete asset
router.delete('/assets/:id', async (req: AuthRequest, res, next) => {
    try {
        await prisma.productAsset.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Asset deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
