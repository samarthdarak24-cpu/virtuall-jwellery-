import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getSession } from 'next-auth/react';

const DATA_FILE = path.join(process.cwd(), 'apps/web/data/users.json');

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session || !session.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const email = session.user.email;

    // Ensure data directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing data
    let users = {};
    if (fs.existsSync(DATA_FILE)) {
        try {
            const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
            users = JSON.parse(fileData);
        } catch (error) {
            console.error('Error reading users.json:', error);
            users = {};
        }
    }

    if (req.method === 'GET') {
        const userProfile = users[email] || {};
        return res.status(200).json(userProfile);
    }

    if (req.method === 'POST') {
        const { fullName, phone, dob, gender, ringSize, address, city, country, postalCode, profileImage } = req.body;

        const updatedProfile = {
            ...users[email], // Keep existing data
            updatedAt: new Date().toISOString(),
            fullName,
            phone,
            dob,
            gender,
            ringSize,
            address,
            city,
            country,
            postalCode,
            profileImage, // Base64 string
        };

        users[email] = updatedProfile;

        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
            return res.status(200).json({ message: 'Profile saved successfully', profile: updatedProfile });
        } catch (error) {
            console.error('Error writing users.json:', error);
            return res.status(500).json({ error: 'Failed to save profile' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
