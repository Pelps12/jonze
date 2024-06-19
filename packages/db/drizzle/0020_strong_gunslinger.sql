CREATE TABLE IF NOT EXISTS "EventTag" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"names" json NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "EventTag" ADD CONSTRAINT "EventTag_id_Event_id_fk" FOREIGN KEY ("id") REFERENCES "Event"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
