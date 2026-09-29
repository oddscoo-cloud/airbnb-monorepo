# airbnb-monorepo

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