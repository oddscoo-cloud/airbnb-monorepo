# Admin setup (development)

Regular registration always creates a `Guest`. To bootstrap or reset the first admin account, set these environment variables in the same PowerShell window used to run the API:

```powershell
$env:Admin__Email = Read-Host 'Admin email'
$adminPassword = Read-Host 'Admin password' -AsSecureString
$env:Admin__Password = [System.Net.NetworkCredential]::new('', $adminPassword).Password
dotnet run --launch-profile http
```

On startup in Development, the API creates the configured account if it does not exist, or assigns it the `Admin` role and configured password if it does. Do not commit the password or put it in `appsettings.json`.

Sign in through the website with that email and password. The server returns the role in the login response and verifies it again at `GET /api/auth/me`. Admin operations require a valid JWT with the `Admin` role; changing browser storage alone does not grant access.

The admin page is available from the account menu. New listings start as drafts. Fill in their address, region, category, price, capacity and coordinates; add optional amenities and images; then publish them. Public `GET /api/listings` only returns published listings. Uploaded image files are stored under `wwwroot/listing-images` and served from `/listing-images/...`.

Existing listings receive `is_published = false` when the migration runs. Edit and publish them in the admin page before they appear in the public catalog.
