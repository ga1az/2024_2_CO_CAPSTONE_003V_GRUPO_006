DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('pending', 'in_progress', 'completed', 'delivered', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."round_status" AS ENUM('pending', 'in_progress', 'completed', 'delivered', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."session_status" AS ENUM('active', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "forgot_password" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(100) NOT NULL,
	"token" varchar(100) NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"password" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL,
	CONSTRAINT "org_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_store" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(200),
	"is_active" boolean DEFAULT true NOT NULL,
	"bg_image" varchar(200),
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modifier_option" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"overcharge" integer DEFAULT 0 NOT NULL,
	"id_modifier" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modifier_product" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_modifier" integer NOT NULL,
	"id_product" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "modifier" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_multiple_choice" boolean DEFAULT false NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"id_store" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL,
	CONSTRAINT "modifier_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_item_modifier" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_order_item" integer NOT NULL,
	"id_modifier_option" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_order_round" integer NOT NULL,
	"id_product" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"quantity" integer NOT NULL,
	"id_price" integer NOT NULL,
	"subtotal" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_round" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_order" integer NOT NULL,
	"status" "round_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_table_session" integer,
	"id_store" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_amount" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id_org_user" integer,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"map_url" text,
	"address" varchar(200),
	"phone" varchar(20),
	"email" varchar(100),
	"website" varchar(100),
	"logo" varchar(200),
	"description" text,
	"company_type" varchar(100) DEFAULT 'restaurant',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_price" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_product" integer NOT NULL,
	"price" integer NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"is_discount" boolean DEFAULT false NOT NULL,
	"discount" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_category" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(200),
	"is_active" boolean DEFAULT true NOT NULL,
	"bg_image" varchar(200),
	"is_gluten_free" boolean,
	"is_vegan" boolean,
	"is_new" boolean,
	"is_popular" boolean,
	"is_spicy" boolean,
	"kcal" integer,
	"sort" integer DEFAULT 0 NOT NULL,
	"is_solo_item" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"desc" varchar(200),
	"bg_image" varchar(200),
	"currency" varchar(10) DEFAULT 'CLP' NOT NULL,
	"currency_symbol" varchar(10) DEFAULT '$' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL,
	"qr_url" varchar(200),
	"personalization" jsonb,
	"map_url" text,
	"address" varchar(200),
	"email" varchar(100),
	"opening_hours" jsonb,
	CONSTRAINT "store_name_unique" UNIQUE("name"),
	CONSTRAINT "store_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table_session" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_table" integer NOT NULL,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"session_token" varchar(100),
	"cart" jsonb DEFAULT '{}' NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"customer_count" integer,
	"tmp_code" varchar(100),
	"expires_at" timestamp,
	CONSTRAINT "table_session_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "table" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" varchar(100) NOT NULL,
	"id_store" integer NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"device_id" varchar(100),
	"qr_code" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL,
	CONSTRAINT "table_identifier_unique" UNIQUE("identifier"),
	CONSTRAINT "table_device_id_unique" UNIQUE("device_id"),
	CONSTRAINT "table_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qr_table" (
	"id" serial PRIMARY KEY NOT NULL,
	"fg_color" varchar(100) DEFAULT '#000000',
	"hide_logo" boolean DEFAULT true NOT NULL,
	"logo" varchar(100) DEFAULT '',
	"scale" integer DEFAULT 1 NOT NULL,
	"id_store" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "category" ADD CONSTRAINT "category_id_store_store_id_fk" FOREIGN KEY ("id_store") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "modifier_option" ADD CONSTRAINT "modifier_option_id_modifier_modifier_id_fk" FOREIGN KEY ("id_modifier") REFERENCES "public"."modifier"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "modifier_product" ADD CONSTRAINT "modifier_product_id_modifier_modifier_id_fk" FOREIGN KEY ("id_modifier") REFERENCES "public"."modifier"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "modifier" ADD CONSTRAINT "modifier_id_store_store_id_fk" FOREIGN KEY ("id_store") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item_modifier" ADD CONSTRAINT "order_item_modifier_id_order_item_order_item_id_fk" FOREIGN KEY ("id_order_item") REFERENCES "public"."order_item"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_id_order_round_order_round_id_fk" FOREIGN KEY ("id_order_round") REFERENCES "public"."order_round"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_item" ADD CONSTRAINT "order_item_id_price_product_price_id_fk" FOREIGN KEY ("id_price") REFERENCES "public"."product_price"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_round" ADD CONSTRAINT "order_round_id_order_order_id_fk" FOREIGN KEY ("id_order") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_id_table_session_table_session_id_fk" FOREIGN KEY ("id_table_session") REFERENCES "public"."table_session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_id_store_store_id_fk" FOREIGN KEY ("id_store") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_id_org_user_org_user_id_fk" FOREIGN KEY ("id_org_user") REFERENCES "public"."org_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_price" ADD CONSTRAINT "product_price_id_product_product_id_fk" FOREIGN KEY ("id_product") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product" ADD CONSTRAINT "product_id_category_category_id_fk" FOREIGN KEY ("id_category") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table_session" ADD CONSTRAINT "table_session_id_table_table_id_fk" FOREIGN KEY ("id_table") REFERENCES "public"."table"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "table" ADD CONSTRAINT "table_id_store_store_id_fk" FOREIGN KEY ("id_store") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "qr_table" ADD CONSTRAINT "qr_table_id_store_store_id_fk" FOREIGN KEY ("id_store") REFERENCES "public"."store"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
