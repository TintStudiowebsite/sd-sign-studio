# SD Sign Studio

React + Vite website for SD Sign Studio.

## Development

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Database Setup

The project uses Supabase/Postgres. Keep `DATABASE_URL` in `.env`; do not commit `.env`.

Run these setup scripts when needed:

```bash
npm run db:gallery
npm run db:banners
npm run db:pricing
```

`db:gallery` creates the gallery table used by the admin gallery page.

`db:banners` creates the desktop/mobile homepage banner tables, exact aspect-ratio validation, atomic publish function, and row-level security policies.

`db:pricing` adds `price_inr` and `price_gbp` to products and backfills existing products from the old `price` column.

## Gallery Media

Large gallery videos and images are intentionally not committed to Git.

The local approved media folder was about 1.85 GB, and some videos were over GitHub's 100 MB file limit, so pushing those files directly to `main` would fail. The repository commits only the gallery code, folder placeholders, and instructions.

Local media folders:

```text
public/gallery-media/images/
public/gallery-media/videos/
```

After adding local media files, regenerate the manifest:

```bash
npm run gallery:manifest
```

For production, upload gallery media to proper storage such as Supabase Storage or Cloudinary instead of committing raw videos to Git.

## Admin Pages

Important admin routes include:

```text
/admin/banners/desktop
/admin/banners/mobile
/admin/gallery
/admin/gallery-banner
/admin/gallery-categories
/admin/products
```

Product pricing is managed with separate INR and GBP fields in the admin product form.

## Homepage Banner Setup

The homepage has independent desktop and mobile banner configurations. Desktop media must be exact 16:9 landscape, while mobile media must be exact 4:5 portrait. Images and videos are stored in Cloudinary; Supabase stores their metadata, ordering, and banner copy.

Apply the database migration after adding `DATABASE_URL` to the uncommitted `.env` file:

```bash
npm run db:banners
```

In the Supabase dashboard, add this Edge Function secret without adding it to a `VITE_` environment variable or committing it:

```text
CLOUDINARY_URL=cloudinary://<api-key>:<api-secret>@<cloud-name>
```

Then link the Supabase CLI to the project and deploy the signed upload/delete function:

```bash
npx supabase login
npx supabase link --project-ref <supabase-project-ref>
npx supabase functions deploy banner-media
```

For non-interactive deployment, put `SUPABASE_ACCESS_TOKEN` only in the ignored local `.env` or the deployment platform's secret manager. Never add a personal access token to `.env.example`.

The Edge Function requires the administrator to have `role = 'admin'` in `public.user_roles`. Cloudinary credentials stay in the Edge Function environment and are never sent to the repository or stored in the browser.

Admin workflow:

1. Open **Banner Management → Desktop Banner** or **Mobile Banner**.
2. Upload an image or video in the required ratio.
3. Preview, replace, edit, remove, or reorder media.
4. Select **Save and Publish** to atomically update the public homepage.
