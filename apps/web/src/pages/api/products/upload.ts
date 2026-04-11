import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        filename: (_name, _ext, part, _form) => {
            const original = part.originalFilename || '';
            // If the frontend sent a pre-formatted timestamped name, use it (cleaning for safety)
            if (original.startsWith('product-') && original.endsWith('.png')) {
                return original.replace(/[^a-zA-Z0-9.-]/g, '');
            }
            // Fallback for random/other uploads
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            return `file-${uniqueSuffix}${path.extname(original)}`;
        },
    });

    try {
        const [fields, files] = await form.parse(req);
        // files.file is usually an array in v3
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // URL path relative to public
        const fileName = path.basename(file.filepath);
        const publicUrl = `/uploads/${fileName}`;

        return res.status(200).json({ url: publicUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Upload failed', error: String(err) });
    }
}
