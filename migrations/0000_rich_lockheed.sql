CREATE TABLE "blog_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"featured_image" text,
	"author_id" varchar,
	"category_id" varchar,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_published" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"seo_title" text,
	"seo_description" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"session_id" text,
	"product_id" varchar,
	"variant_id" varchar,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_info" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" text,
	"email" text,
	"address" text,
	"hours" text,
	"social_links" jsonb,
	"maps_url" text
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"is_replied" boolean DEFAULT false,
	"reply" text,
	"replied_at" timestamp,
	"replied_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" varchar,
	"type" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"company" text,
	"address_1" text NOT NULL,
	"address_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text DEFAULT 'US' NOT NULL,
	"phone" text,
	"is_default" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"first_name" text,
	"last_name" text,
	"phone" text,
	"date_of_birth" timestamp,
	"default_shipping_address" jsonb,
	"default_billing_address" jsonb,
	"total_orders" integer DEFAULT 0,
	"total_spent" integer DEFAULT 0,
	"average_order_value" integer DEFAULT 0,
	"last_order_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_email" text NOT NULL,
	"reply_to_email" text NOT NULL,
	"smtp_host" text NOT NULL,
	"smtp_port" integer DEFAULT 587,
	"smtp_secure" boolean DEFAULT false,
	"smtp_user" text NOT NULL,
	"smtp_pass" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"last_tested" timestamp,
	"test_status" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category_id" varchar,
	"is_published" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"helpful_votes" integer DEFAULT 0,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar,
	"variant_id" varchar,
	"type" text NOT NULL,
	"quantity" integer NOT NULL,
	"reason" text,
	"notes" text,
	"order_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar,
	"product_id" varchar,
	"variant_id" varchar,
	"product_name" text NOT NULL,
	"variant_name" text,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"total_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"user_id" varchar,
	"guest_email" text,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"tax" integer DEFAULT 0,
	"shipping" integer DEFAULT 0,
	"discount" integer DEFAULT 0,
	"total" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"payment_status" text DEFAULT 'pending',
	"payment_method" text,
	"payment_id" text,
	"shipping_address" jsonb,
	"billing_address" jsonb,
	"shipping_method" text,
	"tracking_number" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "page_customizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"elements" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"styles" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_public_key" text,
	"stripe_secret_key" text,
	"is_active" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'pending',
	"method" text NOT NULL,
	"transaction_id" text,
	"gateway_response" jsonb,
	"refunded_amount" integer DEFAULT 0,
	"refund_reason" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar,
	"name" text NOT NULL,
	"value" text NOT NULL,
	"price" integer,
	"sku" text,
	"stock" integer DEFAULT 0,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"short_description" text,
	"price" integer NOT NULL,
	"currency" text DEFAULT 'MXN',
	"compare_price" integer,
	"category_id" varchar,
	"stock" integer DEFAULT 0,
	"low_stock_threshold" integer DEFAULT 5,
	"sku" text,
	"weight" integer,
	"dimensions" jsonb,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"images" jsonb,
	"variants" jsonb,
	"tags" jsonb,
	"seo_title" text,
	"seo_description" text,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "reservation_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_hours" jsonb DEFAULT '{"monday":{"enabled":true,"open":"09:00","close":"18:00"},"tuesday":{"enabled":true,"open":"09:00","close":"18:00"},"wednesday":{"enabled":true,"open":"09:00","close":"18:00"},"thursday":{"enabled":true,"open":"09:00","close":"18:00"},"friday":{"enabled":true,"open":"09:00","close":"18:00"},"saturday":{"enabled":false,"open":"09:00","close":"18:00"},"sunday":{"enabled":false,"open":"09:00","close":"18:00"}}'::jsonb NOT NULL,
	"default_duration" integer DEFAULT 60,
	"buffer_time" integer DEFAULT 15,
	"max_advance_days" integer DEFAULT 30,
	"allowed_services" jsonb DEFAULT '["Consulta general","Cita especializada","Reunión"]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"date" timestamp NOT NULL,
	"time_slot" text NOT NULL,
	"service" text,
	"notes" text,
	"status" text DEFAULT 'pending',
	"duration" integer DEFAULT 60,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"content" text,
	"type" text NOT NULL,
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"config" jsonb
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar,
	"tracking_number" text,
	"carrier" text,
	"service" text,
	"status" text DEFAULT 'pending',
	"shipped_at" timestamp,
	"estimated_delivery" timestamp,
	"delivered_at" timestamp,
	"shipping_cost" integer,
	"weight" integer,
	"dimensions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"config" jsonb NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5,
	"is_approved" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'cliente' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "visual_customizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"element_selector" varchar NOT NULL,
	"element_type" varchar NOT NULL,
	"property" varchar NOT NULL,
	"value" text NOT NULL,
	"label" varchar NOT NULL,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_replied_by_users_id_fk" FOREIGN KEY ("replied_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_faq_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."faq_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_customizations" ADD CONSTRAINT "page_customizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_config" ADD CONSTRAINT "payment_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_config" ADD CONSTRAINT "site_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visual_customizations" ADD CONSTRAINT "visual_customizations_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;