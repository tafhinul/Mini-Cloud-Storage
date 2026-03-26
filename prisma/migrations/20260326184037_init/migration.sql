-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "totalStorageUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_files" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_files" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "physicalFileId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "physical_files_hash_key" ON "physical_files"("hash");

-- AddForeignKey
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_files" ADD CONSTRAINT "user_files_physicalFileId_fkey" FOREIGN KEY ("physicalFileId") REFERENCES "physical_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
