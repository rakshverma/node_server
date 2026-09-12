# JhatkaByte Backend

This folder contains the Node.js API used by the customer website, mobile app, and admin portal.

## Before Deployment

1. Create the production database.

   The app uses PostgreSQL. Supabase Postgres works, but any PostgreSQL provider can be used if `DATABASE_URL` is set.

2. Configure environment variables.

   Copy `.env.example` and set production values in your hosting provider. Do not commit `.env`.

   Required values:

   ```env
   ENV=prod
   DB_TYPE=sql
   DATABASE_URL=postgresql://...
   JWT_SECRET=change-to-long-random-secret
   JWT_REFRESH_SECRET=change-to-another-long-random-secret
   CORS_ORIGINS=https://your-customer-site.com,https://your-admin-site.com
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=change-this-password
   ADMIN_NAME=JhatkaByte Admin
   ADMIN_PHONE=9999999999
   ```

   If using Supabase Storage for images and invoices, also set:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_STORAGE_BUCKET=jb-bucket
   SUPABASE_STORAGE_PUBLIC=true
   ```

   If deploying the Android app, include these origins too:

   ```env
   CORS_ORIGINS=https://your-customer-site.com,https://your-admin-site.com,capacitor://localhost,ionic://localhost
   ```

3. Install dependencies.

   ```bash
   npm ci
   ```

4. Apply the database schema.

   Run this before the first deployment and after schema changes:

   ```bash
   npm run db:schema
   ```

5. Create or update the admin user.

   Run this once before deployment, or whenever the admin password changes:

   ```bash
   npm run admin:create
   ```

6. Verify the backend starts.

   ```bash
   npm start
   ```

   Then open:

   ```text
   /health
   ```

## Docker Deployment

Build the image:

```bash
docker build -t jhatkabyte-api .
```

Run it:

```bash
docker run --env-file .env -p 8080:8080 jhatkabyte-api
```

The container exposes nginx on port `8080`. Node runs inside the container on `NODE_PORT`, default `3000`.

Important: the current Docker entrypoint starts the API and nginx. It does not automatically run `npm run db:schema` or `npm run admin:create`, so run those against the production database before deploying.

## Useful Commands

```bash
npm run db:schema
npm run admin:create
npm start
```

## Final Checklist

- Production database URL is set.
- Database schema has been applied.
- Admin user has been created.
- `CORS_ORIGINS` contains customer site, admin site, and app origins if needed.
- Supabase Storage env values are set if using image/invoice storage.
- `/health` returns success after deployment.
