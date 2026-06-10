# Agent Instructions — PACT Demo API (TypeScript)

Reference implementation of the [PACT Data Exchange Protocol](https://docs.carbon-transparency.org/data-exchange-protocol/) built with TypeScript and Express.js. Supports PACT spec **v2** (`/2/*`) and **v3** (`/3/*`) side-by-side.

See [README.md](README.md) and [DEVELOPERS.md](DEVELOPERS.md) for project overview and setup.

## Build & Run

```bash
npm install          # install deps
npm run dev          # development (nodemon + ts-node, auto-reload)
npm run build        # compile TypeScript → dist/
npm start            # run compiled output
```

TypeScript: strict mode, ES2020 target, CommonJS modules (`tsconfig.json`).

## Architecture

```
src/
  app.ts                     # Express app, all route definitions
  controllers/
    authController.ts        # POST /auth/token
    v2/                      # PACT v2 controllers (footprints, events)
    v3/                      # PACT v3 controllers (footprints, events — richer filtering)
  middlewares/
    authMiddleware.ts        # JWT Bearer token verification
  models/
    v2/productFootprint.ts   # TypeScript types for PACT v2 PCF
    v3/productFootprint.ts   # TypeScript types for PACT v3 PCF
  utils/
    footprints.ts            # In-memory mock data (ProductFootprint[] for v2 & v3)
    auth.ts                  # Outbound token-fetch helper (for webhook callbacks)
    headers.ts               # RFC Link header builder for pagination
    logger.ts                # Pino logger + Express middleware
```

**No database** — all data is in-memory mock arrays in `utils/footprints.ts`.

## Key Conventions

### Adding a new endpoint
1. Define the route in `src/app.ts` with `authenticate` middleware.
2. Add the controller function in the appropriate `controllers/v2/` or `controllers/v3/` file.
3. Export it via the `controllers/v2/index.ts` or `controllers/v3/index.ts` barrel.

### v2 vs v3 parity
When making changes to footprint or event logic, check whether the same change applies to both `v2/` and `v3/` controllers. v3 has richer query filtering (`productId`, `companyId`, `geography`, `validOn`, etc.); v2 only has `limit`/`offset`.

### Error response format
All error responses use PACT-spec error codes:
```json
{ "code": "NoSuchFootprint", "message": "Footprint with id X not found." }
```
Common codes: `NoSuchFootprint`, `NotFound`, `BadRequest`.

### Authentication
- **Inbound**: OAuth 2.0 client credentials flow. Hardcoded demo credentials: `client_id=test_client_id`, `client_secret=test_client_secret`. JWT signed with `JWT_VERIFY_SECRET` env var (defaults to `"default_secret"` in dev).
- **Outbound** (event callbacks): `utils/auth.ts` fetches a token from the source server before posting events.
- `authMiddleware.ts` stores the decoded JWT payload in `res.locals.client`.

### Pagination
Use `getLinksForHeader()` from `utils/headers.ts` to build RFC-compliant `Link` response headers. The base URL is read from `BASE_URL` env var or derived from `req.protocol + req.headers.host`.

### Event handling (CloudEvents)
The events endpoint accepts both `application/json` and `application/cloudevents+json` content types (configured in `app.ts`).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_VERIFY_SECRET` | Yes (prod) | JWT signing secret |
| `PORT` | No | Server port (default: `3000`) |
| `BASE_URL` | No | Public base URL for pagination links |
| `SSL_CERTIFICATE` / `SSL_CERTIFICATE_FILE` | No | TLS certificate (enables HTTPS) |
| `SSL_KEY` / `SSL_KEY_FILE` | No | TLS private key |
| `NODE_ENV` | No | Set to `development` for local dev |
