-- AlterTable
ALTER TABLE "user" ADD COLUMN     "display_name" TEXT;

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");
