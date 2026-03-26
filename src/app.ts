// @ts-nocheck
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import fileRoutes from './routes/fileRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler } from './middlewares/errorHandler';

import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

app.use('/users', userRoutes);
app.use('/users', fileRoutes); // The mount paths will handle /:userId/files

app.use(errorHandler);

export default app;
