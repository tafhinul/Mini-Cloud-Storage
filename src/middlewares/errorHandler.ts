// @ts-nocheck
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A unique constraint violation occurred (e.g., active file with the same name already exists).' });
  }

  // Postgres Check constraint violation code is 23514
  if (err.code === '23514' || err.code === 'P2010' || (err.message && err.message.includes('storage_limit_check'))) {
    return res.status(400).json({ error: 'Storage limit exceeded (500 MB max).' });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
};
