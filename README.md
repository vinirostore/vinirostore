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
```

## Database setup

```bash
npx prisma init
npx prisma migrate dev
```

## Admin bootstrap

Use environment-managed admin credentials and rotate them after the first successful login.

## Notes

- WhatsApp remains intentionally unconfigured until the official business number is confirmed.
- Office/service-origin address and the beyond-10-km pricing formula remain configurable settings and are not invented.
- AMC pricing defaults to Ahmedabad-only at ₹2,900, matching the confirmed business rule.
- Production secrets must never be committed to the repository.
