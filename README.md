# airbnb-monorepo

HomeFU: React + Vite frontend, ASP.NET Core 9 API, PostgreSQL.

## Quick start (Docker, one command)

Requirements: Docker Desktop (or Docker Engine + Compose v2). Nothing else is needed: no .NET SDK, Node.js or local Postgres.

```powershell
docker compose up -d --build
```

| Service | URL / port | Notes |
|---------|-----------|-------|
| Site (nginx + built frontend) | http://localhost:3000 | proxies `/api`, `/listing-images`, `/avatars` to the API |
| API | http://localhost:5189 | Swagger: http://localhost:5189/swagger |
| PostgreSQL | localhost:5432 | db `airbnb_db`, user `postgres` |

On the first start (the API runs with `ASPNETCORE_ENVIRONMENT=Development`) the API itself applies EF migrations, seeds users/amenities and creates the admin account:

- Email: `admin@homefu.local`
- Password: `Admin12345!`

The database starts empty: there are no listings and no regions until they are added in the admin panel or submitted by users.

Stop: `docker compose down` (data is kept). Full reset including the database and uploaded files: `docker compose down -v`.

Rebuild after code changes: `docker compose up -d --build`. Logs: `docker compose logs -f api`.

### Configuration

Override defaults through environment variables or a `.env` file next to `docker-compose.yml`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_PASSWORD` | `postgrespassword` | Postgres password |
| `JWT_KEY` | dev key | JWT signing secret, at least 32 random characters |
| `ADMIN_EMAIL` | `admin@homefu.local` | initial admin email |
| `ADMIN_PASSWORD` | `Admin12345!` | initial admin password |

Docker volumes persist data: `postgres_data` (DB), `listing_images`, `avatars`, `verification_docs`.

### Common problems

- **Port already in use** (3000, 5189, 5432): stop the other project or change the left side of the port mapping in `docker-compose.yml`. A locally installed Postgres on 5432 conflicts with the container.
- **Another project opens on the same port**: check `docker ps`; clear browser cache or open in a private window.
- **Catalog is empty**: expected on a fresh database. Log in as admin, add a listing, or submit one from a verified account and approve it in the admin panel.
- **Role changed in DB but no admin access**: log out and log in again, the role is stored in the JWT.
- Give admin to an existing account:
  `docker exec airbnb_postgres psql -U postgres -d airbnb_db -c "update users set role='Admin' where email='you@example.com'"`

### Moving data from the backend developer's local database

To use the existing local database instead of an empty one:

```powershell
pg_dump -U postgres -d <db_name> -F c -f airbnb.dump
docker compose up -d postgres
docker cp airbnb.dump airbnb_postgres:/tmp/airbnb.dump
docker exec airbnb_postgres pg_restore -U postgres -d airbnb_db --clean --if-exists /tmp/airbnb.dump
docker compose up -d --build
```

Images and avatars from the local `wwwroot` should be copied into the `listing_images` and `avatars` volumes.

## Running without Docker (development)

Requirements: .NET SDK 9, Node.js 20+, PostgreSQL 16.

1. Create a database and set the connection string and `Jwt:Key` (user secrets or env vars `ConnectionStrings__DefaultConnection`, `Jwt__Key`).
2. Backend: `cd backend\Airbnb.Api; dotnet run` (Development applies migrations and seeds data).
3. Frontend: `cd frontend; npm install; npm run dev`.

## User listing submissions

- A logged-in, verified user opens "Запропонувати помешкання на HomeFU" and fills in the form (details, region, photos 1–15, amenities). Region is typed with suggestions; a new name creates a region.
- The submission goes to the admin panel, tab "Заявки". The admin can edit a pending submission, approve it (it is published) or reject it with a reason shown to the user.
- API: `POST /api/host/listings`, `GET /api/host/listings/mine`, `GET /api/admin/submissions`, `PUT /api/admin/submissions/{id}`, `POST /api/admin/submissions/{id}/approve|reject`, `GET /api/region/all`.

## Production notes (for the backend developer)

The Docker setup is intended for development and demos. Before a real deployment:

- Run migrations (`dotnet ef database update`) and create the admin as a separate step instead of relying on Development mode; set `ASPNETCORE_ENVIRONMENT=Production`.
- Use real secrets for `JWT_KEY`, `POSTGRES_PASSWORD`, `ADMIN_PASSWORD`; do not commit them.
- Do not expose Postgres (remove the `5432` port mapping) and disable Swagger.
- Put the site behind HTTPS (reverse proxy / load balancer).
- Back up the volumes (database, images, verification documents).

## Authentication API

The backend exposes JWT authentication at `/api/auth`:

- `POST /register`: `email`, `password`, `confirm_password`, optional names; returns `201 Created`.
- `POST /login`: returns `access_token` and `refresh_token`; the refresh token is also set as an HTTP-only cookie.
- `POST /refresh`: accepts `refresh_token` JSON or the cookie and rotates the refresh token.
- `POST /logout`: revokes the supplied or cookie refresh token.

Access tokens are valid for 30 minutes and refresh tokens for 30 days. Refresh tokens are stored as SHA-256 hashes in `RefreshTokens`. Send access tokens as `Authorization: Bearer <access_token>`; listing creation is protected as an example.

Before deploying, set `Jwt:Key` through user secrets or an environment variable (`Jwt__Key`) to a random secret of at least 32 characters. Apply the schema with:

```powershell
dotnet ef database update --project backend\Airbnb.Api\Airbnb.Api.csproj --startup-project backend\Airbnb.Api\Airbnb.Api.csproj
```