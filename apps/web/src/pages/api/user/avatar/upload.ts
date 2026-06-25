import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  
  // Ensure upload directory exists
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }

  const form = formidable({
    maxFileSize: 15 * 1024 * 1024, // 15MB
    uploadDir: uploadDir,
    keepExtensions: true,
    filename: (name: string, ext: string, part: any) => {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      return `avatar-${timestamp}-${random}${ext}`;
    },
    filter: function (part: any) {
      // Allow VRM and GLB files
      const validExtensions = ['.vrm', '.glb'];
      const ext = path.extname(part.originalFilename || '').toLowerCase();
      return validExtensions.includes(ext);
    }
  });

  try {
    const [fields, files] = await form.parse(req);
    const avatarFile = files.avatar?.[0];

    if (!avatarFile) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    // Validate file extension
    const ext = path.extname(avatarFile.originalFilename || '').toLowerCase();
    if (!['.vrm', '.glb'].includes(ext)) {
      // Delete uploaded file
      try {
        await fs.unlink(avatarFile.filepath);
      } catch (err) {
        console.error('Failed to delete invalid file:', err);
      }
      return res.status(400).json({ error: 'Invalid file type. Only VRM and GLB files are allowed.' });
    }

    // Generate public URL
    const filename = path.basename(avatarFile.filepath);
    const avatarUrl = `/uploads/avatars/${filename}`;

    // TODO: Save to database if using authentication
    // For now, return the URL for client-side storage
    
    res.status(200).json({ 
      avatarUrl, 
      success: true,
      filename: avatarFile.originalFilename
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}
