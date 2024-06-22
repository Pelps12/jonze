ALTER TABLE "Membership" ADD COLUMN "responseId" varchar(128);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Membership" ADD CONSTRAINT "Membership_responseId_FormResponse_id_fk" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
