import { PrismaClient } from '@prisma/client';
// import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportMetrics() {
    console.log('📊 Exporting analytics metrics...');

    // Get try-on events
    const tryOnEvents = await prisma.tryOnEvent.findMany({
        include: {
            user: {
                select: {
                    email: true,
                },
            },
            product: {
                select: {
                    sku: true,
                    title: true,
                },
            },
        },
    });

    const records = tryOnEvents.map(event => ({
        id: event.id,
        mode: event.mode,
        userEmail: event.user?.email || 'Anonymous',
        productSku: event.product?.sku || 'N/A',
        productTitle: event.product?.title || 'N/A',
        createdAt: event.createdAt.toISOString(),
    }));

    // Export as JSON instead of CSV
    const outputPath = path.join(process.cwd(), 'metrics-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));
    
    console.log(`✅ Exported ${records.length} events to metrics-export.json`);
}

exportMetrics()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
