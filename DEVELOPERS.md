# PACT Demo API - Developer Guide

## Overview

This is a demo implementation of the PACT (Partnership for Carbon Transparency) API specification, built with TypeScript and Express.js. The API provides endpoints for managing product carbon footprints and handling carbon footprint request events via webhooks.

The API supports both PACT v2 and v3 specifications and includes:

- Product footprint management endpoints
- Webhook event handling for carbon footprint requests
- JWT-based authentication
- AWS deployment infrastructure (ECS with Terraform)

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software

- **Node.js**: Version 20.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For version control

### Optional Tools (for deployment)

- **Docker**: For containerization
- **AWS CLI**: For cloud deployment
- **Terraform**: For infrastructure as code

## Local Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:wbcsd/pact-demo-api-ts.git
cd pact-demo-api-ts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# JWT Configuration
JWT_VERIFY_SECRET=your_secret_key_here

# Development Settings
NODE_ENV=development
```

**Note**: The `JWT_VERIFY_SECRET` should be a secure random string in production. For development, you can use any string.

### 4. Build the Project

```bash
npm run build
```

### 5. Start Development Server

```bash
# For development with auto-reload
npm run dev

# OR for production mode
npm start
```

The server will start on `http://localhost:3000`.

## Project Structure

```
pact-demo-endpoint/
├── src/
│   ├── app.ts                    # Main Express application
│   ├── controllers/              # Request handlers
│   │   ├── authController.ts     # Authentication endpoints
│   │   ├── v2/                   # PACT v2 controllers
│   │   │   ├── eventsController.ts
│   │   │   └── footprintController.ts
│   │   └── v3/                   # PACT v3 controllers
│   │       ├── eventsController.ts
│   │       └── footprintController.ts
│   ├── middlewares/              # Express middlewares
│   │   └── authMiddleware.ts     # JWT authentication
│   ├── models/                   # Data models/types
│   │   ├── v2/
│   │   │   └── productFootprint.ts
│   │   └── v3/
│   │       └── productFootprint.ts
│   └── utils/                    # Utility functions
│       ├── auth.ts               # Authentication helpers
│       ├── footprints.ts         # Mock footprint data
│       ├── headers.ts            # HTTP header utilities
├── infra/                        # AWS Terraform configuration
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── Dockerfile                   # Docker configuration
└── README.md                    # Basic project info
```

## API Endpoints

### Authentication

- `POST /auth/token` - Obtain JWT access token using client credentials

### PACT v2 Endpoints

- `GET /2/footprints` - List product footprints
- `GET /2/footprints/:id` - Get specific footprint by ID
- `POST /2/events` - Handle carbon footprint request events (webhook)

### PACT v3 Endpoints

- `GET /3/footprints` - List product footprints (v3 schema)
- `GET /3/footprints/:id` - Get specific footprint by ID (v3 schema)
- `POST /3/events` - Handle carbon footprint request events (v3 webhook)

### Health Check

- `GET /health` - Health status endpoint

## Authentication Flow

The API uses OAuth 2.0 client credentials flow with JWT tokens:

1. **Get Access Token**:

   ```bash
   curl -X POST http://localhost:3000/auth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -H "Authorization: Basic dGVzdF9jbGllbnRfaWQ6dGVzdF9jbGllbnRfc2VjcmV0" \
     -d "grant_type=client_credentials"
   ```

   **Default credentials for development**:

   - Client ID: `test_client_id`
   - Client Secret: `test_client_secret`
   - Base64 encoded: `dGVzdF9jbGllbnRfaWQ6dGVzdF9jbGllbnRfc2VjcmV0`

2. **Use Access Token**:
   ```bash
   curl -X GET http://localhost:3000/3/footprints \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## Testing the API

### Manual Testing with curl

1. **Health Check**:

   ```bash
   curl http://localhost:3000/health
   ```

2. **Get Access Token**:

   ```bash
   curl -X POST http://localhost:3000/auth/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -H "Authorization: Basic dGVzdF9jbGllbnRfaWQ6dGVzdF9jbGllbnRfc2VjcmV0" \
     -d "grant_type=client_credentials"
   ```

3. **List Footprints**:

   ```bash
   # Replace YOUR_TOKEN with the access_token from step 2
   curl -X GET http://localhost:3000/3/footprints \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Get Specific Footprint**:

   ```bash
   curl -X GET http://localhost:3000/3/footprints/b1f8c0d2-7c4e-4e67-9a9c-2e4c12345678 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

5. **Test Webhook Event**:
   ```bash
   curl -X POST http://localhost:3000/3/events \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "specversion": "1.0",
       "type": "org.wbcsd.pact.ProductFootprint.RequestEvent.3",
       "source": "http://localhost:3000",
       "id": "test-123",
       "time": "2024-01-01T00:00:00Z",
       "data": {
         "productId": ["urn:gtin:1234567890123"]
       }
     }'
   ```

### Testing with Postman

Import the following collection structure:

1. **Environment Variables**:

   - `base_url`: `http://localhost:3000`
   - `access_token`: (will be set after authentication)

2. **Requests**:
   - Health Check: `GET {{base_url}}/health`
   - Get Token: `POST {{base_url}}/auth/token`
   - List Footprints: `GET {{base_url}}/3/footprints`
   - Get Footprint: `GET {{base_url}}/3/footprints/b1f8c0d2-7c4e-4e67-9a9c-2e4c12345678`

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Use async/await for asynchronous operations
- Handle errors appropriately with try/catch blocks

### Adding New Endpoints

1. Create controller function in appropriate version folder
2. Add route definition in routes folder
3. Update app.ts if needed
4. Test the endpoint manually

### Mock Data

- Footprint data is stored in `src/utils/footprints.ts`
- Add new mock footprints to the arrays for testing
- Both v2 and v3 schemas are supported

## Docker Development

### Build Docker Image

```bash
docker build -t pact-demo-endpoint .
```

### Run Docker Container

```bash
docker run -p 3000:3000 -e JWT_VERIFY_SECRET=your_secret pact-demo-endpoint
```

## Deployment

The project includes automated AWS deployment using GitHub Actions with Terraform and ECS.

### GitHub Actions CI/CD Pipeline

The deployment pipeline (`.github/workflows/deploy.yml`) automatically triggers on pushes to the `main` branch and performs:

1. **Infrastructure Management**:

   - Runs Terraform format check, validation, and planning
   - Applies infrastructure changes to AWS (ECS cluster, ECR repository, VPC, etc.)
   - Uses secrets for JWT verification and AWS credentials

2. **Application Build & Deploy**:
   - Sets up Node.js 22 environment and installs dependencies
   - Compiles TypeScript to JavaScript (`npm run build`)
   - Builds Docker image and tags it with Git SHA and `latest`
   - Pushes images to AWS ECR repository
   - Forces ECS service deployment with new image
   - Waits for deployment completion and reports service status

**Required Secrets**:

- `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for deployment
- `JWT_VERIFY_SECRET` - JWT signing secret for the application

## Troubleshooting

### Common Issues

1. **Port already in use**:

   - Change the PORT environment variable
   - Or kill the process using the port: `lsof -ti:3000 | xargs kill`

2. **JWT verification fails**:

   - Ensure JWT_VERIFY_SECRET is set consistently
   - Check token expiration (tokens expire after 1 hour)

3. **Authentication fails**:

   - Verify client credentials are correct
   - Ensure Content-Type is `application/x-www-form-urlencoded`
   - Check Authorization header format

4. **TypeScript build errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript version compatibility

### Logs

- Application logs are output to console
- For production deployment, logs are sent to AWS CloudWatch

## Environment Variables Reference

| Variable            | Description        | Default          | Required   |
| ------------------- | ------------------ | ---------------- | ---------- |
| `PORT`              | Server port        | `3000`           | No         |
| `JWT_VERIFY_SECRET` | JWT signing secret | `default_secret` | Yes (prod) |
| `NODE_ENV`          | Environment        | `development`    | No         |

## API Schema Versions

The API supports both PACT v2.0.0 and v3.0.0 specifications:

- **v2 endpoints**: `/2/*` - Uses PACT 2.0.0 schema
- **v3 endpoints**: `/3/*` - Uses PACT 3.0.0 schema

The main differences:

- v3 uses `productClassifications` instead of `productCategoryCpc`
- v3 has updated PCF calculation fields
- v3 includes additional verification and extension support
