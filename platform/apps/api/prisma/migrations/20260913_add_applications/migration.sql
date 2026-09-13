CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "applicationNumber" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "applicantName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "tcIdentityNumber" TEXT NOT NULL,
  "classLevel" TEXT NOT NULL,
  "birthDate" TEXT NOT NULL,
  "school" TEXT,
  "experiences" TEXT,
  "motivation" TEXT NOT NULL,
  "preferences" JSONB NOT NULL,
  "additions" TEXT,
  "delegationSize" INTEGER NOT NULL DEFAULT 1,
  "delegationMembers" JSONB,
  "accuracyConsent" BOOLEAN NOT NULL,
  "kvkkConsent" BOOLEAN NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Application_applicationNumber_key" ON "Application"("applicationNumber");
CREATE INDEX "Application_type_idx" ON "Application"("type");
CREATE INDEX "Application_status_idx" ON "Application"("status");
