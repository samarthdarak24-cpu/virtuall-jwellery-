import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data/users.json');

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Get email from request body for now (in production, use proper auth)
    const email = req.body?.email || req.query?.email;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Ensure data directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing data
    let users: any = {};
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

        console.log('Saving profile for:', email);
        console.log('Data received:', { fullName, phone, dob, gender, ringSize, address, city, country, postalCode, hasImage: !!profileImage });

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
            console.log('Profile saved successfully for:', email);
            return res.status(200).json({ message: 'Profile saved successfully', profile: updatedProfile });
        } catch (error: any) {
            console.error('Error writing users.json:', error);
            return res.status(500).json({ error: 'Failed to save profile', details: error.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
