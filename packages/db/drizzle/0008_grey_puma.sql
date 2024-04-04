CREATE TABLE IF NOT EXISTS "Customer" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"stripeId" varchar(128) NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
