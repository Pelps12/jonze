ALTER TYPE "provider" ADD VALUE 'Cash';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "APIKey" ADD CONSTRAINT "APIKey_memId_Member_id_fk" FOREIGN KEY ("memId") REFERENCES "Member"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memId_Member_id_fk" FOREIGN KEY ("memId") REFERENCES "Member"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_responseId_FormResponse_id_fk" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Customer" ADD CONSTRAINT "Customer_memId_Member_id_fk" FOREIGN KEY ("memId") REFERENCES "Member"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_orgId_Organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Event" ADD CONSTRAINT "Event_formId_OrganizationForm_id_fk" FOREIGN KEY ("formId") REFERENCES "OrganizationForm"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formId_OrganizationForm_id_fk" FOREIGN KEY ("formId") REFERENCES "OrganizationForm"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_memId_Member_id_fk" FOREIGN KEY ("memId") REFERENCES "Member"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Member" ADD CONSTRAINT "Member_orgId_Organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Membership" ADD CONSTRAINT "Membership_memId_Member_id_fk" FOREIGN KEY ("memId") REFERENCES "Member"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "Membership" ADD CONSTRAINT "Membership_planId_plan_id_fk" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "OrganizationForm" ADD CONSTRAINT "OrganizationForm_orgId_Organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "plan" ADD CONSTRAINT "plan_orgId_Organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
