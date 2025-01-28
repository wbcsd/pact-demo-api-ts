import express from "express";
import footprintRoutes from "./routes/footprintRoutes";

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Define routes
app.use("/2/footprints", footprintRoutes);

// Default route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    code: "NotFound",
    message: "Endpoint not found.",
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
