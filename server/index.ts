import "dotenv/config";
import express from "express";
import cors from "cors";
import { createOrder, getConfig, verifyPayment } from "./routes/payments";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // Payments API
  app.get("/api/payments/config", getConfig);
  app.post("/api/payments/order", createOrder);
  app.post("/api/payments/verify", verifyPayment);

  return app;
}