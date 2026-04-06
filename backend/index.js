import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { connectDB } from "./config/database-config.js";
import { errorHandler, notFound } from "./middlewares/error-middleware.js";
import aiRoutes from "./routes/ai-route.js";
import authRoutes from "./routes/auth-route.js";
import sessionRoutes from "./routes/session-route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;
let isDatabaseConnected = false;

const normalizeOrigin = (value = "") => value.trim().replace(/\/+$/, "");

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PRODUCTION,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  "http://localhost:5173",
].filter(Boolean).map(normalizeOrigin);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "NightMarathon backend is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const ensureDatabaseConnection = async () => {
  if (isDatabaseConnected) {
    return;
  }

  try {
    await connectDB();
    isDatabaseConnected = true;
  } catch (error) {
    throw error;
  }
};

const startServer = async () => {
  try {
    await ensureDatabaseConnection();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

if (process.env.VERCEL !== "1") {
  startServer();
}

export default async function handler(req, res) {
  await ensureDatabaseConnection();
  return app(req, res);
}
