import express, { Application } from "express";
import cors from "cors";
import config from "./config";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import projectRoutes from "./modules/projects/projects.routes";

const app: Application = express();

// CORS Middleware - allow dynamic configuration
app.use(
  cors({
    origin: config.frontendUrl || "http://localhost:3000",  // Dynamically configure CORS origin
    credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  // Allow relevant HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"],  // Specify allowed headers
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug root route to test Vercel rewrites
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    message: "Welcome to Project Management API",
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
  });
});

// Health check
app.get(["/health", "/api/health"], (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes (mount on both /api and root for Vercel serverless compatibility)
app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/projects", "/projects"], projectRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;