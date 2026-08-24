import express, { Express } from "express";
import cors from "cors";
import { RouteDependencies, createApiRouter } from "./routes/api.routes";
import { errorHandler } from "./middlewares/error.middleware";

export function createServer(deps: RouteDependencies): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", createApiRouter(deps));
  app.use(errorHandler);

  return app;
}
