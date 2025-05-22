-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'de');

-- AlterTable
ALTER TABLE "UserPreference" ADD COLUMN     "locale" "Locale" NOT NULL DEFAULT 'en';
