import { Router } from 'express';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Configure S3
const s3 = new AWS.S3({
    endpoint: process.env.S3_ENDPOINT,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
    region: process.env.S3_REGION || 'us-east-1',
});

const BUCKET = process.env.S3_BUCKET!;

// Get presigned URL for upload
router.post('/presign', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            throw new AppError('fileName and fileType are required', 400);
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'model/gltf+json', 'model/gltf-binary'];
        if (!allowedTypes.includes(fileType)) {
            throw new AppError('Invalid file type', 400);
        }

        const key = `uploads/${req.userId}/${uuidv4()}-${fileName}`;

        const uploadUrl = s3.getSignedUrl('putObject', {
            Bucket: BUCKET,
            Key: key,
            ContentType: fileType,
            Expires: 300, // 5 minutes
        });

        const fileUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

        res.json({
            uploadUrl,
            fileUrl,
            key,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
