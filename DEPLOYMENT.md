# NewsDarpan Deployment Guide (Vercel)

Follow these steps to deploy NewsDarpan to Vercel.

## 1. Prerequisites
- A Vercel account.
- A cloud PostgreSQL database (e.g., [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)).

## 2. Setup Database
1. Create a new PostgreSQL database in your provider of choice.
2. Get the connection string (it should look like `postgresql://user:password@host:port/dbname`).
3. Ensure the connection string is compatible with Prisma 7 and the `@prisma/adapter-pg` driver.

## 3. Configure Vercel Project
1. Import your repository into Vercel.
2. The project is pre-configured with `vercel.json` and `package.json` to handle Prisma generation during build.
3. In the **Environment Variables** section, add the following:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Your cloud database connection string |
| `NEXTAUTH_SECRET` | `generate-a-long-random-string` | Used to encrypt JWTs (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Your Vercel deployment URL |
| `GOOGLE_CLIENT_ID` | `your-id` | (Optional) For Google login |
| `GOOGLE_CLIENT_SECRET` | `your-secret` | (Optional) For Google login |

## 4. Post-Deployment: Create Admin User
Since the system requires a Level 11 Admin to manage everything, you should create the first user via a script or by using `npx prisma studio` (if connected to prod) and setting `level: 11` and a hashed password.

## 5. Local Setup
```bash
# Install dependencies
npm install

# Setup local database in Docker
docker compose up -d

# Push schema to database
npx prisma db push

# Start dev server
npm run dev
```
