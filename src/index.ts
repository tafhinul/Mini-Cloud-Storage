// @ts-nocheck
declare var process: any;
import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Attempt to automatically apply constraints after Prisma pushes the base schema.
    // If it fails (e.g. schema not yet pushed), we ignore the warning and instruct the user in README.
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'storage_limit_check'
        ) THEN
          ALTER TABLE "users" ADD CONSTRAINT "storage_limit_check" CHECK ("totalStorageUsed" <= 524288000);
        END IF;

        IF NOT EXISTS (
           SELECT 1
           FROM   pg_class c
           JOIN   pg_namespace n ON n.oid = c.relnamespace
           WHERE  c.relname = 'user_file_name_active_idx'
           AND    n.nspname = 'public'
        ) THEN
          CREATE UNIQUE INDEX "user_file_name_active_idx" ON "user_files" ("userId", "fileName") WHERE "isActive" = true;
        END IF;
      END
      $$;
    `).catch((err: any) => {
      console.warn("Could not apply raw SQL constraints automatically.", err.message);
    });

    app.listen(PORT, () => {
      console.log(`Mini Cloud Storage API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
