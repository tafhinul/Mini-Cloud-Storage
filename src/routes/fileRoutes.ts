import { Router } from 'express';
import { FileController } from '../controllers/fileController';

const router = Router();

// Endpoint paths are mounted dynamically on /users/:userId/files in app.ts, so the route here is /:userId/files
router.post('/:userId/files', FileController.uploadFile);
router.delete('/:userId/files/:fileId', FileController.deleteFile);

export default router;
