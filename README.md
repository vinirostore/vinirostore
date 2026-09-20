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
