-- AlterTable: Remove tenant_id from categories
ALTER TABLE "categories" DROP COLUMN "tenant_id";

-- AlterTable: Remove tenant_id from products
ALTER TABLE "products" DROP COLUMN "tenant_id";

-- AlterTable: Remove tenant_id from customers
ALTER TABLE "customers" DROP COLUMN "tenant_id";

-- AlterTable: Remove tenant_id from order_items
ALTER TABLE "order_items" DROP COLUMN "tenant_id";

-- AlterTable: Remove tenant_id, payment_date, payment_method from orders; add number
ALTER TABLE "orders" DROP COLUMN "payment_date",
DROP COLUMN "payment_method",
DROP COLUMN "tenant_id",
ADD COLUMN "number" TEXT;

-- Backfill number for existing orders using order id
UPDATE "orders" SET "number" = CONCAT('ORD-', id) WHERE "number" IS NULL;

-- Make number NOT NULL and add unique constraint
ALTER TABLE "orders" ALTER COLUMN "number" SET NOT NULL;

-- CreateTable: payments
CREATE TABLE "payments" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on payments.order_id
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex unique number on orders
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- AddForeignKey for payments -> orders
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
