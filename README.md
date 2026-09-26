# VINI RO SERVICES

This project is a production-oriented Next.js ecommerce and service-management platform for VINI RO SERVICES.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ready for extension
- Cashfree integration-ready service boundary
- Shiprocket integration-ready service boundary
- Redis/background queue-ready architecture

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## MilesWeb deployment

This application requires MilesWeb Node.js hosting. It is not a static HTML export.

1. In MilesWeb cPanel, open **Setup Node.js App** and create an application using Node.js 20 or newer.
2. Set the application root to `vini-ro-services` and the startup file to `server.js`.
3. Upload the contents of this folder to the application root. Keep `package.json`, `package-lock.json`, `.next`, `public`, and `server.js` together.
4. Run `npm install` and then `npm run build` in the application root. The build must finish successfully before starting the app.
5. Add the production variables from `.env.example` in the Node.js app environment settings. Set the two Supabase variables if the hosted site should share admin catalog data across browsers.
	Set `ADMIN_PHONE`, `ADMIN_BIRTHDATE`, and `ADMIN_ACCESS_SECRET` as server-only variables as well. Generate the signing secret with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`; never use a `NEXT_PUBLIC_` prefix for these values.
6. Set the application URL/domain in `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, and `NEXT_PUBLIC_API_BASE_URL`.
7. Restart the Node.js application. Verify `https://your-domain.example/api/health` returns JSON with `"ok": true`.

The app listens on MilesWeb's assigned `PORT` and binds to `0.0.0.0`, as required by the Node.js application manager. Do not place the Next.js app in `public_html` as a static site and do not commit `.env.local` or production secrets.

## Environment variables

Create a `.env.local` using the example values in `.env.example`.

Example:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/vini"
NEXTAUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
CASHFREE_CLIENT_ID=""
CASHFREE_CLIENT_SECRET=""
SHIPROCKET_API_KEY=""
SHIPROCKET_SECRET=""
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ADMIN_PHONE=""
ADMIN_BIRTHDATE=""
ADMIN_ACCESS_SECRET=""
```

The Supabase anon/publishable key is intended for browser use; never put the service-role key in the client or in a `NEXT_PUBLIC_` variable. `ADMIN_PHONE` and `ADMIN_BIRTHDATE` are checked only by the server route. `ADMIN_ACCESS_SECRET` signs the short-lived, HttpOnly admin-verification cookie.

## Database setup

```bash
npx prisma init
npx prisma migrate dev
```

## Admin bootstrap

Keep the existing admin user in Supabase Authentication. Set or reset that user's password in Supabase and use that password on `/login`; the app does not keep an admin password. The phone and birth date remain the second verification step, with their values configured only in the server environment. Reapply `supabase/schema.sql` in the Supabase SQL Editor after reviewing it to create the admin RLS policies without disabling RLS.

## Notes

- WhatsApp remains intentionally unconfigured until the official business number is confirmed.
- Office/service-origin address and the beyond-10-km pricing formula remain configurable settings and are not invented.
- AMC pricing defaults to Ahmedabad-only at ₹2,900, matching the confirmed business rule.
- Production secrets must never be committed to the repository.
