import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all products (with optional filters)
router.get('/', optionalAuth, async (req: AuthRequest, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const published = req.query.published !== 'false';

        const where = published ? { published: true } : {};

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    assets: true,
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            products,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        next(error);
    }
});

// Get single product by ID
router.get('/:id', optionalAuth, async (req: AuthRequest, res, next) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: {
                assets: true,
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
});

export default router;
