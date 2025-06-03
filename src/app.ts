import express from "express";
import footprintRoutes from "./routes/footprintRoutes";
import v3FootprintRoutes from "./routes/v3FootprintRoutes";
import authRoutes from "./routes/authRoutes";
import webhookRoutes from "./routes/eventsRoutes";
import v3EventsRoutes from "./routes/v3EventsRoutes";

const app = express();

// Middleware for parsing JSON
app.use(
  express.json({
    type: ["application/json", "application/cloudevents+json"],
  })
);

// Define routes
app.use("/2/footprints", footprintRoutes);
app.use("/2/events", webhookRoutes);

app.use("/3/footprints", v3FootprintRoutes);
app.use("/3/events", v3EventsRoutes);

app.use("/auth", authRoutes);

// Health endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// Default route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    code: "NotFound",
    message: `Endpoint ${req.path}  not found.`,
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
