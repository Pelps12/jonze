CREATE TABLE IF NOT EXISTS "Blog" (
	"name" varchar(128) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
