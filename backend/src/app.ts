import express, { Application, Request, Response, NextFunction } from "express";
import config from "./config";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/users.routes";
import projectRoutes from "./modules/projects/projects.routes";

const app: Application = express();

const ALLOWED_ORIGIN = process.env.FRONTEND_URL || config.frontendUrl || "http://localhost:3000";

// Manual CORS middleware — handles everything including preflight
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  // Set CORS headers on every response
  const allowed = [
    "http://localhost:3000",
    "http://localhost:5000",
    ALLOWED_ORIGIN,
  ];

  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    // Non-browser request (Postman etc)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight immediately
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug root route
app.get(["/", "/api"], (req, res) => {
  res.status(200).json({
    message: "Welcome to Project Management API",
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    allowedOrigin: ALLOWED_ORIGIN,
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

// API Routes
app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/projects", "/projects"], projectRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
