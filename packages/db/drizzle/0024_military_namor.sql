CREATE TABLE IF NOT EXISTS "MemberTag" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"names" jsonb NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "MemberTag" ADD CONSTRAINT "MemberTag_id_Member_id_fk" FOREIGN KEY ("id") REFERENCES "Member"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
