# StackPost API

Express.js API with Supabase PostgreSQL and JWT authentication.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill in `.env`:

- `SUPABASE_URL` — Project Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → **service_role** (secret, starts with `eyJ...`). Do **not** use the publishable/anon key (`sb_publishable_...`).
- `DATABASE_URL` — Project Settings → Database → Connection string → URI (use your database password)
- `JWT_SECRET` — a long random string
- `JWT_EXPIRES_IN` — optional, default `7d`

4. Start the server (migrations run automatically on startup):

```bash
npm run dev
```

## Deploy to Vercel

This API runs as a serverless function via [`api/index.js`](api/index.js) and [`vercel.json`](vercel.json).

1. Push the repo to GitHub and import the project on [vercel.com](https://vercel.com).
2. Set **Environment variables** (Production):

| Variable | Required on Vercel |
|----------|-------------------|
| `SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `JWT_SECRET` | Yes |
| `JWT_EXPIRES_IN` | Optional |
| `META_GRAPH_VERSION` | Optional |
| `DATABASE_URL` | No (migrations not run on Vercel) |

3. Run migrations once locally or in Supabase SQL Editor: `npm run migrate`
4. Deploy. Test: `https://YOUR-PROJECT.vercel.app/health`

**Note:** Uploads use `/tmp` on Vercel (ephemeral). Files are not persisted on disk after the function ends; `file_path` in `broadcast_details` may not refer to a durable file on Vercel.

Local development still uses `npm run dev` → [`src/server.js`](src/server.js) with `DATABASE_URL` required.

## API Endpoints

### Health check

```bash
curl http://localhost:3000/health
```

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"username\":\"janedoe\",\"password\":\"securePassword123\",\"user_category\":\"users\"}"
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "username": "janedoe",
      "user_category": "users",
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

Note: Public registration always stores `user_category` as `users` even if `admin` is sent.

### Channel details (requires JWT)

Store social channel credentials per user (`channel_details` table).

**Upsert** — `PUT /api/auth/channels` with header `Authorization: Bearer <token>`:

```json
{
  "token": "page_or_channel_access_token",
  "page_id": "1106978669169411",
  "channel_type": "facebook"
}
```

`channel_type`: `instagram`, `facebook`, or `linkedin`. Upserts on `(user_id, page_id, channel_type)` from the JWT.

**Get** — `GET /api/auth/channels` with `Authorization: Bearer <token>`

Returns channels for the authenticated user only. Optional query: `?channel_type=facebook`.

### Customer queries

**Submit (public)** — `POST /api/auth/customer-queries` (no auth). All body fields are optional (`name`, `company_name`, `phone_number`, `email_id`, `message`); omitted fields are stored as `null`. If provided, `email_id` must be a valid email.

```bash
curl -X POST http://localhost:3000/api/auth/customer-queries \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John\",\"message\":\"Hello\"}"
```

Response `201`: `{ "success": true, "data": { "query": { ... } } }`

**List (admin only)** — `GET /api/auth/customer-queries` with `Authorization: Bearer <token>` where `user_category` is `admin`:

```bash
curl http://localhost:3000/api/auth/customer-queries \
  -H "Authorization: Bearer ADMIN_JWT"
```

Returns all rows (newest first). Non-admin users receive `403`.

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jane@example.com\",\"password\":\"securePassword123\"}"
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { ... }
  }
}
```

### Broadcast to channels (requires JWT)

`POST /api/broadcast` — `multipart/form-data` + `Authorization: Bearer <token>`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `media` | file | Yes | Image or video |
| `channel_types` | string | Yes | JSON array, e.g. `["facebook"]` or comma-separated `facebook` |
| `message` | string | No | Caption for posts |

Loads `token` and `page_id` from `channel_details` for the authenticated user and each requested `channel_type`. **Facebook** posts via Graph API; other types return not-implemented until added.

```bash
curl -X POST http://localhost:3000/api/broadcast \
  -H "Authorization: Bearer YOUR_JWT" \
  -F "channel_types=[\"facebook\"]" \
  -F "message=Hello everyone" \
  -F "media=@./photo.jpg"
```

Response includes `results` (successful posts per page) and `errors` (failed or missing channels).

On each successful Facebook post, a row is saved in `broadcast_details` (`user_id`, `channel_type`, `message`, `file_path`). Restart the server to apply migration `003_create_broadcast_details.sql`.

### Post to Facebook Page

`POST /api/facebook/post` — `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accessToken` | string | Yes | Facebook Page access token (`pages_manage_posts`) |
| `pageId` | string | Yes | Facebook Page ID |
| `message` | string | No | Caption / description |
| `media` | file | Yes | Image (`image/*`) or video (`video/*`), max 100MB |

```bash
curl -X POST http://localhost:3000/api/facebook/post \
  -F "accessToken=YOUR_PAGE_ACCESS_TOKEN" \
  -F "pageId=YOUR_PAGE_ID" \
  -F "message=Hello from StackPost" \
  -F "media=@./photo.jpg"
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "postId": "123456789_987654321",
    "type": "photo",
    "media": {
      "filename": "1735123456-123456789.jpg",
      "originalName": "photo.jpg",
      "storedPath": "uploads/media/1735123456-123456789.jpg",
      "mimeType": "image/jpeg",
      "size": 1234567
    }
  }
}
```

Uploaded files are saved under `uploads/media/` and are **not** deleted after posting (ignored by git via `.gitignore`).

**Meta setup:** Create an app at [developers.facebook.com](https://developers.facebook.com), add the Pages product, and obtain a Page access token with `pages_manage_posts`. Optional env: `META_GRAPH_VERSION` (default `v21.0`).

Email/password cannot be used — Meta requires Graph API tokens.

## User fields

| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| email | string | Unique, stored lowercase |
| username | string | Unique, 3–30 chars, alphanumeric + underscore |
| password | string | Min 8 chars, hashed with bcrypt |
| user_category | enum | `admin`, `users`, or `employee` |

## Migrations

SQL files in [supabase/migrations/](supabase/migrations/) are applied automatically when the server starts. Applied migrations are tracked in `public.schema_migrations`.

Run migrations only (without starting the API):

```bash
npm run migrate
```

Add new migrations as numbered files (e.g. `002_add_column.sql`); each file runs once.

## Scripts

- `npm run dev` — start with nodemon (runs migrations first)
- `npm start` — production start (runs migrations first)
- `npm run migrate` — apply pending migrations only
