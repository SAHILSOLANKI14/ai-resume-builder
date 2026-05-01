-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubId" TEXT,
ALTER COLUMN "plan" SET DEFAULT 'FREE',
ALTER COLUMN "credits" SET DEFAULT 3;
