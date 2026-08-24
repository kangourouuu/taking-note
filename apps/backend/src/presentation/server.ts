import express, { Express } from "express";
import cors, { CorsOptions } from "cors";
import { RouteDependencies, createApiRouter } from "./routes/api.routes";
import { errorHandler } from "./middlewares/error.middleware";

export interface ServerOptions {
  corsOrigin?: string;
}

export function createServer(deps: RouteDependencies, options?: ServerOptions): Express {
  const app = express();

  const corsOptions: CorsOptions = {
    origin: options?.corsOrigin
      ? options.corsOrigin.includes(",")
        ? options.corsOrigin.split(",").map((o) => o.trim())
        : options.corsOrigin
      : true,
    credentials: true
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", createApiRouter(deps));
  app.use(errorHandler);

  return app;
}
