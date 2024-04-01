DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "provider" AS ENUM('Jonze', 'Cashapp', 'Zelle', 'Venmo', 'Other', 'None');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "APIKey" (
	"keyId" varchar(128) NOT NULL,
	"memId" varchar(128) NOT NULL,
	"hint" varchar(20) NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "APIKey_keyId_memId_pk" PRIMARY KEY("keyId","memId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Attendance" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"memId" varchar(128) NOT NULL,
	"eventId" varchar(128) NOT NULL,
	"responseId" varchar(128),
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Event" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"start" timestamp (6) with time zone NOT NULL,
	"end" timestamp (6) with time zone NOT NULL,
	"description" text,
	"image" varchar(191),
	"orgId" varchar(128) NOT NULL,
	"formId" varchar(128),
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "FormResponse" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"formId" varchar(128) NOT NULL,
	"response" json NOT NULL,
	"memId" varchar(128),
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Member" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"orgId" varchar(128) NOT NULL,
	"userId" varchar(128) NOT NULL,
	"role" "role" DEFAULT 'MEMBER' NOT NULL,
	"additionalInfoId" varchar(128),
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "plan" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"orgId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"start" timestamp with time zone,
	"interval" bigint,
	"decimal" numeric,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "Organization" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(191) NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "OrganizationForm" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"orgId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"form" json NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "User" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"firstName" varchar(191),
	"lastName" varchar(191),
	"email" varchar(191) NOT NULL,
	"emailVerified" boolean NOT NULL,
	"profilePictureUrl" varchar(191),
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_key" UNIQUE("email")
);
