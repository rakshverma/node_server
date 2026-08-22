# Supabase Backend Setup

## Environment

Copy `.env.example` to `.env` and fill these values from your Supabase project:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres.your-project-ref:your-password@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_SSL=true
SUPABASE_STORAGE_BUCKET=jb-bucket
SUPABASE_STORAGE_PUBLIC=true
```

Use the service role key only on the backend. Do not expose it in React apps.

## Storage

Create a Supabase Storage bucket matching `SUPABASE_STORAGE_BUCKET`.

For public frontend image access, make the bucket public. Product images are stored under:

```txt
products/
```

Order invoices are stored under:

```txt
invoices/
```

The backend keeps `/uploads/...` URLs working by redirecting them to the bucket public URL.

## Database

This backend now connects to Supabase Postgres through `SUPABASE_DB_URL`.

The old `dump.sql` is a MySQL dump, so it cannot be imported into Supabase unchanged. Create/migrate the same application tables in Supabase Postgres first, then import the data. Keep camelCase columns such as `cartId`, `userId`, `productId`, `franchiseId`, and `shippingCost` as quoted identifiers, because the existing service code expects those names.

For shipping-cost upserts, add this unique constraint:

```sql
ALTER TABLE tbl_shipping_cost
ADD CONSTRAINT tbl_shipping_cost_user_pin_unique UNIQUE (user_id, pin_code);
```

After setup:

```bash
npm install
node index.js
```
