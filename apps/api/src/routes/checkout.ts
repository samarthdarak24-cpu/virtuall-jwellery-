import { Router } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Initialize Stripe only if key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
    })
    : null;

// Create checkout session
router.post('/create-session', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { items } = req.body; // Array of { productId, quantity, customization }

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Invalid items' });
        }

        // Fetch products
        const productIds = items.map((item: any) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        // Calculate total
        let totalCents = 0;
        items.forEach((item: any) => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                totalCents += product.priceCents * (item.quantity || 1);
            }
        });

        // DEV MODE: If no Stripe key, create order directly and redirect to success
        if (!stripe) {
            console.log('⚠️  DEMO MODE: No Stripe key configured. Creating order without payment...');
            
            // Create order directly (demo mode)
            const order = await prisma.order.create({
                data: {
                    userId: req.userId!,
                    totalCents: totalCents,
                    status: 'pending', // In demo mode
                },
            });

            // Return success URL for demo
            const demoSessionId = `demo_${order.id}_${Date.now()}`;
            return res.json({ 
                sessionId: demoSessionId, 
                url: `${process.env.CORS_ORIGIN}/checkout/success?session_id=${demoSessionId}`,
                demo: true,
                message: 'Demo mode: Order created without payment. Add STRIPE_SECRET_KEY to enable real payments.'
            });
        }

        // PRODUCTION MODE: Create Stripe checkout session
        const lineItems = items.map((item: any) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) throw new Error('Product not found');

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                        description: product.description || undefined,
                    },
                    unit_amount: product.priceCents,
                },
                quantity: item.quantity || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CORS_ORIGIN}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CORS_ORIGIN}/checkout/cancel`,
            metadata: {
                userId: req.userId!,
            },
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        next(error);
    }
});

// Stripe webhook handler
router.post('/webhooks/stripe', async (req, res, next) => {
    if (!stripe) {
        return res.status(400).json({ error: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'] as string;

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            // Create order
            await prisma.order.create({
                data: {
                    userId: session.metadata!.userId,
                    totalCents: session.amount_total || 0,
                    status: 'completed',
                },
            });
        }

        res.json({ received: true });
    } catch (error) {
        next(error);
    }
});

export default router;
