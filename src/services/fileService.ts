import prisma from '../config/db';

const STORAGE_LIMIT = 500 * 1024 * 1024; // 500 MB limit

export class FileService {
  static async uploadFile(userId: number, fileName: string, size: number, hash: string) {
    // 1. Fail early if obvious limit breach
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found.' };
    if (user.totalStorageUsed + size > STORAGE_LIMIT) {
      throw { status: 400, message: 'Storage limit exceeded (500 MB max).' };
    }

    return await prisma.$transaction(async (tx: any) => {
      // 2. Check for duplicate active file name
      const exist = await tx.userFile.findFirst({
        where: { userId, fileName, isActive: true }
      });
      if (exist) {
        throw { status: 409, message: 'An active file with this name already exists for the user.' };
      }

      // 3. Upsert physical file (Deduplication Feature)
      const physicalFile = await tx.physicalFile.upsert({
        where: { hash },
        update: {},
        create: { hash, size }
      });

      // 4. Update user quota
      // DB constraint "storage_limit_check" ensures this strictly prevents concurrency race conditions.
      await tx.user.update({
        where: { id: userId },
        data: {
          totalStorageUsed: { increment: size }
        }
      });

      // 5. Create UserFile mapped to physical file
      return await tx.userFile.create({
        data: {
          userId,
          physicalFileId: physicalFile.id,
          fileName,
          isActive: true
        }
      });
    });
  }

  static async deleteFile(userId: number, fileId: number) {
    const userFile = await prisma.userFile.findUnique({
      where: { id: fileId },
      include: { physicalFile: true }
    });

    if (!userFile || userFile.userId !== userId || !userFile.isActive) {
      throw { status: 404, message: 'Active file not found for this user.' };
    }

    return await prisma.$transaction(async (tx: any) => {
      // Soft Delete
      await tx.userFile.update({
        where: { id: fileId },
        data: { isActive: false }
      });

      // Free user storage
      await tx.user.update({
        where: { id: userId },
        data: {
          totalStorageUsed: { decrement: userFile.physicalFile.size }
        }
      });

      return { message: 'File deleted successfully' };
    });
  }

  static async getStorageSummary(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };

    const activeFilesCount = await prisma.userFile.count({
      where: { userId, isActive: true }
    });

    const remainingStorage = Math.max(0, STORAGE_LIMIT - user.totalStorageUsed);

    return {
      userId: user.id,
      userName: user.userName,
      totalStorageUsed: user.totalStorageUsed,
      remainingStorage,
      totalActiveFiles: activeFilesCount,
      limit: STORAGE_LIMIT
    };
  }

  static async listUserFiles(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { status: 404, message: 'User not found' };

    const files = await prisma.userFile.findMany({
      where: { userId, isActive: true },
      include: { physicalFile: true },
      orderBy: { uploadTime: 'desc' }
    });

    return files.map((f: any) => ({
      id: f.id,
      fileName: f.fileName,
      size: f.physicalFile.size,
      hash: f.physicalFile.hash,
      uploadTime: f.uploadTime
    }));
  }
}
