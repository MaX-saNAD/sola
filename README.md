# SOLA Cosmetics – Store + Admin

React (Vite) single page app + Express API + Supabase (database & image storage).
Orders are sent to your WhatsApp as a pre-filled message. No payment gateway needed.

## Pages
- `/` – hero, products, about, contact (Instagram + WhatsApp), footer with Instagram
- `/product/:id` – product page
- `/admin` – dashboard: add / edit / delete products, upload images, price, stock, visible/hidden, order; edit WhatsApp & social links in **Settings**

## Try it locally (no setup)
```bash
npm install
npm run dev
```
Open http://localhost:5173 — admin at `/admin`, password `admin123`.
Without Supabase keys it uses in-memory demo data (resets on restart).

## Deploy for free (Supabase + Vercel) ~10 minutes
1. **Supabase** → create a free project → *SQL Editor* → paste `supabase/schema.sql` → Run.
   (Creates the tables, the public `products` image bucket, your 2 default products and settings.)
2. In Supabase → *Project Settings → API* copy the **Project URL** and the **service_role** key.
3. Put this folder on GitHub (don't commit `.env`).
4. **Vercel** → *Add New Project* → import the repo (framework: Vite is auto-detected).
5. Add Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `ADMIN_PASSWORD` (your admin login)
   - `JWT_SECRET` (any long random text)
6. Deploy. Visit `your-site.vercel.app/admin`.

The service key is only used on the server (the `/api` function) and never reaches the browser.

## Structure
```
src/        React app (pages, components, styles.css)
server/     Express app (app.js), data layer (store.js), local dev server (dev.js)
api/        Vercel entry (exports the Express app)
supabase/   schema.sql
public/     logo + default product images
```
Product images uploaded in admin are resized in the browser and stored in Supabase Storage.
