import { Request, Response } from 'express';
import { FileService } from '../services/fileService';

export class FileController {
  
  static async uploadFile(req: Request, res: Response) {
    const userId = parseInt(req.params.userId, 10);
    const { name, size, hash } = req.body;

    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
    if (!name || typeof size !== 'number' || !hash) {
      return res.status(400).json({ error: 'Missing required file metadata (name, size, hash)' });
    }

    const file = await FileService.uploadFile(userId, name, size, hash);
    return res.status(201).json({ message: 'File uploaded successfully', file });
  }

  static async deleteFile(req: Request, res: Response) {
    const userId = parseInt(req.params.userId, 10);
    const fileId = parseInt(req.params.fileId, 10);

    if (isNaN(userId) || isNaN(fileId)) {
        return res.status(400).json({ error: 'Invalid user or file ID' });
    }

    const result = await FileService.deleteFile(userId, fileId);
    return res.status(200).json(result);
  }
}
