import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('Demo@123!', 12);
    const user = await prisma.user.upsert({
        where: { email: 'demo@jewelfit.test' },
        update: {},
        create: {
            email: 'demo@jewelfit.test',
            password: hashedPassword,
            name: 'Demo User',
        },
    });

    console.log('✅ Created demo user:', user.email);
    console.log('   Password: Demo@123!');

    // Create products
    const products = [
        {
            sku: 'JF-NECK-001',
            title: 'Vintage Gold Necklace',
            description: '14K gold chain with elegant pendant. Timeless design perfect for any occasion.',
            priceCents: 129990,
            published: true,
            assets: [
                {
                    type: 'MODEL_GLTF',
                    url: '/assets/models/necklace.glb',
                    metadata: { anchors: ['neck_anchor'] },
                },
                {
                    type: 'IMAGE_2D',
                    url: '/assets/images/necklace_2d.png',
                    metadata: { width: 512, height: 512 },
                },
                {
                    type: 'PBR_BASECOLOR',
                    url: '/assets/textures/necklace_basecolor.png',
                },
                {
                    type: 'PBR_NORMAL',
                    url: '/assets/textures/necklace_normal.png',
                },
                {
                    type: 'PBR_METALROUGH',
                    url: '/assets/textures/necklace_metalrough.png',
                },
            ],
        },
        {
            sku: 'JF-EAR-002',
            title: 'Diamond Stud Earrings',
            description: 'Classic diamond studs in white gold setting. 0.5 carat total weight.',
            priceCents: 89990,
            published: true,
            assets: [
                {
                    type: 'MODEL_GLTF',
                    url: '/assets/models/earring.glb',
                    metadata: { anchors: ['ear_lobe_L', 'ear_lobe_R'] },
                },
                {
                    type: 'IMAGE_2D',
                    url: '/assets/images/earring_2d.png',
                    metadata: { width: 256, height: 256 },
                },
                {
                    type: 'PBR_BASECOLOR',
                    url: '/assets/textures/earring_basecolor.png',
                },
            ],
        },
        {
            sku: 'JF-RING-003',
            title: 'Classic Solitaire Ring',
            description: 'Platinum solitaire engagement ring with 1 carat diamond.',
            priceCents: 249990,
            published: true,
            assets: [
                {
                    type: 'MODEL_GLTF',
                    url: '/assets/models/ring.glb',
                    metadata: { anchors: ['finger_2_L'] },
                },
                {
                    type: 'IMAGE_2D',
                    url: '/assets/images/ring_2d.png',
                    metadata: { width: 256, height: 256 },
                },
                {
                    type: 'PBR_BASECOLOR',
                    url: '/assets/textures/ring_basecolor.png',
                },
                {
                    type: 'PBR_METALROUGH',
                    url: '/assets/textures/ring_metalrough.png',
                },
            ],
        },
    ];

    for (const productData of products) {
        const { assets, ...productInfo } = productData;

        const product = await prisma.product.upsert({
            where: { sku: productInfo.sku },
            update: productInfo,
            create: {
                ...productInfo,
                assets: {
                    create: assets.map(asset => ({
                        type: asset.type,
                        url: asset.url,
                        metadata: asset.metadata ? JSON.stringify(asset.metadata) : null,
                    })),
                },
            },
            include: {
                assets: true,
            },
        });

        console.log(`✅ Created product: ${product.title}`);
    }

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
