-- AlterTable
ALTER TABLE "UserConsent" ALTER COLUMN "version" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SavedIssue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "issueUrl" TEXT NOT NULL,
    "issueTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'interested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedIssue_userId_status_idx" ON "SavedIssue"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SavedIssue_userId_organization_repository_issueNumber_key" ON "SavedIssue"("userId", "organization", "repository", "issueNumber");

-- AddForeignKey
ALTER TABLE "SavedIssue" ADD CONSTRAINT "SavedIssue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
