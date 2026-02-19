-- CreateEnum
CREATE TYPE "SheetOption" AS ENUM ('PROVIDED', 'NOT_PROVIDED', 'WILL_PROVIDE_LATER');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "sheetOption" "SheetOption" NOT NULL DEFAULT 'NOT_PROVIDED',
ADD COLUMN     "sheetUrl" TEXT;
