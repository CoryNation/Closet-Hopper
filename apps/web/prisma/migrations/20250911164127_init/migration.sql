-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."License" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeSessionId" TEXT,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activation" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "profileHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "License_key_key" ON "public"."License"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Activation_licenseId_profileHash_key" ON "public"."Activation"("licenseId", "profileHash");

-- AddForeignKey
ALTER TABLE "public"."License" ADD CONSTRAINT "License_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activation" ADD CONSTRAINT "Activation_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "public"."License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
