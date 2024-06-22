ALTER TABLE "plan" ADD COLUMN "formId" varchar(128);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan" ADD CONSTRAINT "plan_formId_OrganizationForm_id_fk" FOREIGN KEY ("formId") REFERENCES "OrganizationForm"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
