import express from "express";
import fs from "fs";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import pino from "pino-http";
import { getToken } from "./controllers/authController";
import { authenticate } from "./middlewares/authMiddleware";
import * as v2 from "./controllers/v2";
import * as v3 from "./controllers/v3";
import logger from "./utils/logger";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware for parsing JSON
app.use(
  express.json({
    type: ["application/json", "application/cloudevents+json"],
  })
);
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Pino logging middleware
app.use(
  pino({
    logger,
    name: process.env.SERVICE_NAME,
    // Log debug information for anything lower than production
    level: process.env.NODE_ENV === "prod" ? "info" : "debug",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  })
);

// Auth routes
app.post("/auth/token", getToken);

// Version 2.x routes
app.get("/2/footprints", authenticate, v2.footprints.getFootprints);
app.get("/2/footprints/:id", authenticate, v2.footprints.getFootprintById);
app.post("/2/events", authenticate, v2.events.createEvent);

// Version 3.x routes
app.get("/3/footprints", authenticate, v3.footprints.getFootprints);
app.get("/3/footprints/:id", authenticate, v3.footprints.getFootprintById);
app.post("/3/events", authenticate, v3.events.createEvent);

// Define health check route
app.get("/health-check", (_, res) => {
  res.status(200).send({
    status: "OK",
    service: process.env.SERVICE_NAME,
    git_commit: process.env.RENDER_GIT_COMMIT || "N/A",
    render_service_name: process.env.RENDER_SERVICE_NAME || "N/A",
    render_service_type: process.env.RENDER_SERVICE_TYPE || "N/A",
  });
});

// Default route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    code: "NotFound",
    message: `Endpoint ${req.path}  not found.`,
  });
});

// SSL configuration
const cert =
  process.env.SSL_CERTIFICATE ??
  (process.env.SSL_CERTIFICATE_FILE
    ? fs.readFileSync(process.env.SSL_CERTIFICATE_FILE as string)
    : undefined);
const key =
  process.env.SSL_KEY ??
  (process.env.SSL_KEY_FILE
    ? fs.readFileSync(process.env.SSL_KEY_FILE as string)
    : undefined);

// Start the server
const PORT = process.env.PORT || 3000;
if (!cert && !key) {
  logger.warn("No SSL certificate or key provided. Running in HTTP mode.");
}
var server =
  !cert || !key
    ? http.createServer(app)
    : https.createServer({ key, cert }, app);
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
