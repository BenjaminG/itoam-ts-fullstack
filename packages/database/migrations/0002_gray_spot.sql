CREATE TABLE "orders" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v4 () NOT NULL,
	"side" char(1) NOT NULL,
	"quantity" numeric NOT NULL,
	"leverage" numeric NOT NULL,
	"entry_price" numeric NOT NULL,
	"margin" bigint NOT NULL,
	"liquidation_price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
