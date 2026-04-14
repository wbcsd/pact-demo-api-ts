# PACT Demo API (TypeScript)

A demo implementation of the [PACT](https://carbon-transparency.org/) (Partnership for Carbon Transparency) Data Exchange Protocol. This project serves as a reference and sample for solution providers looking to add PACT-conformant APIs on top of their software solutions.

Built with **TypeScript** and **Express.js** — chosen for readability and ease of transferring concepts to other languages and frameworks.

## Supported Specifications

This demo supports the following versions of the [PACT Technical Specifications](https://docs.carbon-transparency.org/data-exchange-protocol/):

| Version | Endpoints | Specification |
| ------- | --------- | ------------- |
| 2.x     | `/2/*`    | [PACT Tech Specs 2.x](https://docs.carbon-transparency.org/tr/data-exchange-protocol/2.3) |
| 3.0     | `/3/*`    | [PACT Tech Specs 3.x](https://docs.carbon-transparency.org/tr/data-exchange-protocol/latest/) |

## Features

- **Product Footprint endpoints** — list and retrieve Product Carbon Footprints (PCFs)
- **Event / webhook handling** — receive and respond to carbon footprint request events
- **OAuth 2.0 authentication** — client credentials flow with JWT tokens
- **Multi-version support** — run v2 and v3 side-by-side on one server

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev
```

The server starts on `http://localhost:3000`. See [DEVELOPERS.md](DEVELOPERS.md) for detailed setup, API usage examples, and configuration options.

## API Overview

| Method | Path               | Description                          |
| ------ | ------------------ | ------------------------------------ |
| POST   | `/auth/token`      | Obtain access token                  |
| GET    | `/2/footprints`    | List footprints (v2)                 |
| GET    | `/2/footprints/:id`| Get footprint by ID (v2)             |
| POST   | `/2/events`        | Handle footprint request events (v2) |
| GET    | `/3/footprints`    | List footprints (v3)                 |
| GET    | `/3/footprints/:id`| Get footprint by ID (v3)             |
| POST   | `/3/events`        | Handle footprint request events (v3) |
| GET    | `/health`          | Health check                         |

## License

ISC
