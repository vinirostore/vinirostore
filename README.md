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
CASHFREE_ENVIRONMENT="sandbox"
RESEND_API_KEY=""
ORDER_CONFIRMATION_FROM_EMAIL="VINI RO SERVICES <orders@yourdomain.example>"
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ORDER_TEMPLATE=""
WHATSAPP_TEMPLATE_LANGUAGE="en"
WHATSAPP_GRAPH_API_VERSION="v23.0"
SHIPROCKET_EMAIL=""
SHIPROCKET_PASSWORD=""
SHIPROCKET_PICKUP_LOCATION=""
SHIPROCKET_PICKUP_PINCODE=""
REDIS_URL="redis://localhost:6379"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
ADMIN_PHONE=""
ADMIN_BIRTHDATE=""
ADMIN_ACCESS_SECRET=""
```

The Supabase anon/publishable key is intended for browser use; never put `SUPABASE_SERVICE_ROLE_KEY` in the client or in a `NEXT_PUBLIC_` variable. `ADMIN_PHONE` and `ADMIN_BIRTHDATE` are checked only by the server route. `ADMIN_ACCESS_SECRET` signs the short-lived, HttpOnly admin-verification cookie. Cashfree client credentials, the Supabase service-role key, and Shiprocket credentials/pickup details are server-only; never commit them.

## Signup email OTP

Registration now stays on the site and verifies a six-digit Supabase signup code. In Supabase **Authentication → Emails → Confirm signup**, use `{{ .Token }}` as visible text and remove `{{ .ConfirmationURL }}`. The existing **Magic link or OTP** template controls passwordless login; it does not control signup confirmation. Also set the Supabase Site URL to the current site domain so any other Auth redirects do not point at the old website.

## Cashfree payments

Set `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET` from the Cashfree dashboard, `CASHFREE_ENVIRONMENT=sandbox` while testing, and `SUPABASE_SERVICE_ROLE_KEY` from Supabase server settings. The checkout creates the Cashfree order on the server using current catalog prices; the browser never supplies the payable total. Payment is marked paid only after a Cashfree order-status check or a valid signed webhook.

Before live payments, complete Cashfree activation, set `CASHFREE_ENVIRONMENT=production`, use production API credentials, and whitelist the production domain in Cashfree. Register `https://your-domain.example/api/cashfree/webhook` under Cashfree payment webhooks for success, failure, and user-dropped events. The webhook uses the Cashfree client secret to validate signatures. Keep `NEXT_PUBLIC_SITE_URL` set to the exact HTTPS site origin for Cashfree return and webhook URLs.

For an existing Supabase database, apply the order columns, unique Cashfree order ID index, and customer order-insert policy removals from `supabase/schema.sql`. This is required before using the new payment route. Set Supabase's service-role key only in server environment settings; it is used for validated price/order writes and payment status updates.

After Cashfree confirms payment, the customer receives an order email through Resend and the owner receives an approved WhatsApp template message at +91 9104881806. Configure `RESEND_API_KEY` and a verified `ORDER_CONFIRMATION_FROM_EMAIL`. For WhatsApp, configure a Meta WhatsApp Cloud API access token and phone-number ID, and approve a template whose body has three text placeholders in this order: order number, customer name, and total. Set its name in `WHATSAPP_ORDER_TEMPLATE`; the language and Graph API version can be overridden with the corresponding environment variables. These are server-only settings. The app logs delivery failures without changing the confirmed payment status.

Customer profiles are created when checkout starts, not when an account is registered or signed in. To remove old profiles that have no associated orders, back up the database and run `supabase/cleanup-profiles-without-orders.sql` once in the Supabase SQL Editor. It keeps profiles associated with any order, including pending orders; deleting a profile also cascades to that customer's service requests. Supabase Auth accounts are not deleted, so those users can still sign in and have a profile recreated when they order.

## Shiprocket delivery

Add `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`, and `SHIPROCKET_PICKUP_PINCODE` to the server environment. The admin Shipping page checks courier serviceability and rates, creates the Shiprocket shipment, assigns the selected courier/AWB, and stores the tracking details. Prepaid orders can only be dispatched after their payment status is set to `paid`; COD availability depends on the Shiprocket account and delivery pincode.

For an existing Supabase database, apply `supabase/migrations/20261004180000_add_shiprocket_order_columns.sql` and the `Admins can view all profiles` policy from `supabase/schema.sql` in the Supabase SQL Editor before deploying. The migration adds delivery state, package dimensions, Cashfree IDs, and Shiprocket order/shipment/AWB fields, including `orders.shiprocket_awb_code`; the admin-only profile read supports shipment creation. The checkout requires the customer's delivery state; package weight and dimensions are entered in the admin Shipping page. Customers can view live AWB activity from **Account → Track delivery**; this requires Shiprocket server credentials.

## Model color variants

Model records store the primary color and alternate color names, images, and prices in the existing `colors` JSONB column. Model stock is stored in `models.inventory`. The existing database records this as migration version `20261003` (`add_model_inventory`); keep `supabase/migrations/20261003_add_model_inventory.sql` at that exact version so Supabase can match local and remote migration history. Admin model saves are written to Supabase before the local cache is updated.

Existing alternate colors without a saved price continue using the model's base product price. Edit those models in **Admin → Models** and set each alternate color's price to override it.

## Inventory and sales overview

**Admin → Inventory** reads product, accessory, and model stock from Supabase and saves edits back to the corresponding `products.inventory`, `accessories.stock`, or `models.inventory` value. Model records already represented by a linked product are shown through that product to avoid duplicate stock counts. The page refreshes every 30 seconds. The storefront and checkout use these stock values to show availability and reject orders that exceed current stock.

The admin overview calculates paid sales, order and pending-payment counts, and customers with orders from `public.orders`. The seven-day sales chart and inventory summary refresh every 30 seconds. Sales totals include only paid, non-cancelled orders.

## Service and AMC bookings

Service and AMC bookings require a signed-in customer account and are linked to that Auth user. New bookings receive a unique service UUID encoded in the customer's QR code. Apply `supabase/migrations/20261003120100_service_booking_qr.sql`, `supabase/migrations/20261003120200_service_staff_portal.sql`, and `supabase/migrations/20261003120300_customer_data_in_supabase.sql` to an existing database before using the booking, technician, and shopping portals. Technicians sign in or create an account at `/service-portal` and request access once; an admin approves the request in **Admin → Services**. Approval is saved to the technician account, so approved technicians can sign in later with their password or a six-digit email code and scan without requesting approval again. A successful scan records the technician's name and completion time on the service request, visible in the customer's full service history and admin service list. Admins can permanently delete false requests from the booking list.

For email confirmation, set the Supabase project's **Authentication → URL Configuration → Site URL** to `https://viniro.store` when the production domain is live; never use a local or numeric IP URL. Add `https://viniro.store/auth/callback`, `http://localhost:3000/auth/callback`, and the current HTTPS development-tunnel callback to **Redirect URLs**. Technician accounts use a six-digit email code entered in the portal; set the Supabase **Confirm sign up** email template to display `{{ .Token }}` as text, not as a link. Customer signup verification also uses this code. The optional confirmation redirect goes through `/auth/callback`.

Customer profiles, orders, service bookings, catalog records, carts, and wishlists are stored in Supabase. Guest carts and wishlists are stored in an opaque, HTTP-only-cookie-linked Supabase row and transferred into the customer account after sign-in; guests are prompted to sign in before checkout. The browser catalog cache is memory-only. Supabase Auth sessions use cookies rather than browser local storage.

**Admin → Orders** also reads directly from `public.orders`; the old sample orders have been removed. A successful Cashfree payment moves an order from pending to processing, Shiprocket dispatch changes it to shipped, and an admin can mark a paid processing or shipped order as delivered. The order then moves into the Delivered list. Status lists and counts refresh every 30 seconds.

## Database setup

### Model reviews

Reviews shown on model pages are stored in Supabase in `public.model_reviews`. Apply `supabase/migrations/20261005100000_add_model_reviews.sql` in the Supabase SQL Editor before enabling customer submissions. It enables public reads and authenticated, row-level-secured create/update access; each signed-in customer can submit one review per model and edit their own review. The browser does not use a service-role key.

```bash
npx prisma init
npx prisma migrate dev
```

## Admin bootstrap

Keep the existing admin user in Supabase Authentication. Set or reset that user's password in Supabase and use that password on `/login`; the app does not keep an admin password. The phone and birth date remain the second verification step, with their values configured only in the server environment. Reapply `supabase/schema.sql` in the Supabase SQL Editor after reviewing it to create the admin RLS policies without disabling RLS.

## Notes

- WhatsApp order notifications require the configured WhatsApp Cloud API credentials and approved message template.
- Office/service-origin address and the beyond-10-km pricing formula remain configurable settings and are not invented.
- AMC pricing defaults to Ahmedabad-only at ₹2,900, matching the confirmed business rule.
- Production secrets must never be committed to the repository.
