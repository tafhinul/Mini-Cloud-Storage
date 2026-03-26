import { Request, Response } from 'express';
import { FileService } from '../services/fileService';

export class UserController {
  
  static async getStorageSummary(req: Request, res: Response) {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

    const summary = await FileService.getStorageSummary(userId);
    return res.status(200).json(summary);
  }

  static async listFiles(req: Request, res: Response) {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

    const files = await FileService.listUserFiles(userId);
    return res.status(200).json({ files });
  }
}
