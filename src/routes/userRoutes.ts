import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// Endpoint paths are mounted on /users in app.ts
router.get('/:userId/storage-summary', UserController.getStorageSummary);
router.get('/:userId/files', UserController.listFiles);

export default router;
