CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4 () NOT NULL,
	"email" varchar(318) NOT NULL,
	"password" text NOT NULL,
	"balance" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
