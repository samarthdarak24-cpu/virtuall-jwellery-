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
    if (req.method === 'GET') {
        const products = getProducts();
        return res.status(200).json(products);
    }

    if (req.method === 'POST') {
        const { name, price, category, image } = req.body;

        if (!name || !price || !category || !image) {
            return res.status(400).json({ message: 'Missing fields' });
        }

        const products = getProducts();
        const newProduct = {
            id: Date.now().toString(),
            name,
            price: Number(price),
            category, // 'necklace', 'earring', 'ring', 'nosepin', 'bracelet'
            image,
            createdAt: new Date().toISOString()
        };

        products.push(newProduct);
        saveProducts(products);

        return res.status(201).json(newProduct);
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
