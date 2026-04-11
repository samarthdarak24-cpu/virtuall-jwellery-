import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'products.json');

function getProducts() {
    if (!fs.existsSync(DB_PATH)) return [];
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveProducts(products: any[]) {
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === 'DELETE') {
        const products = getProducts();
        // Force string for reliable comparison
        const targetId = String(Array.isArray(id) ? id[0] : id);

        const filtered = products.filter((p: any) => String(p.id) !== targetId);

        if (products.length === filtered.length) {
            return res.status(404).json({ message: 'Product not found' });
        }

        saveProducts(filtered);
        return res.status(200).json({ message: 'Product deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
