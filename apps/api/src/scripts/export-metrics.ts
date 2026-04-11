import { PrismaClient } from '@prisma/client';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

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

    const csvWriter = createObjectCsvWriter({
        path: path.join(process.cwd(), 'metrics-export.csv'),
        header: [
            { id: 'id', title: 'Event ID' },
            { id: 'mode', title: 'Mode' },
            { id: 'userEmail', title: 'User Email' },
            { id: 'productSku', title: 'Product SKU' },
            { id: 'productTitle', title: 'Product Title' },
            { id: 'createdAt', title: 'Timestamp' },
        ],
    });

    const records = tryOnEvents.map(event => ({
        id: event.id,
        mode: event.mode,
        userEmail: event.user?.email || 'Anonymous',
        productSku: event.product?.sku || 'N/A',
        productTitle: event.product?.title || 'N/A',
        createdAt: event.createdAt.toISOString(),
    }));

    await csvWriter.writeRecords(records);
    console.log(`✅ Exported ${records.length} events to metrics-export.csv`);
}

exportMetrics()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
