import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(__dirname, '../../uploads', filename);

    fs.writeFileSync(filepath, file.buffer);

    const imageUrl = `http://localhost:5000/uploads/${filename}`;

    return res.json({
      imageUrl,
      filename,
      message: 'Image uploaded successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Upload failed' });
  }
};
