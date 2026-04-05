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
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
