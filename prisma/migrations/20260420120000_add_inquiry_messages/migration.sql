-- Add enum used by InquiryMessage.sender
DO $$
BEGIN
  CREATE TYPE "InquirySender" AS ENUM ('STUDENT', 'OWNER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Add normalized inquiry message history table
CREATE TABLE IF NOT EXISTS "inquiry_messages" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "sender" "InquirySender" NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inquiry_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "inquiry_messages_inquiryId_createdAt_idx"
ON "inquiry_messages"("inquiryId", "createdAt");

DO $$
BEGIN
  ALTER TABLE "inquiry_messages"
  ADD CONSTRAINT "inquiry_messages_inquiryId_fkey"
  FOREIGN KEY ("inquiryId") REFERENCES "inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
