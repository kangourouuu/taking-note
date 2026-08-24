import express, { Express } from "express";
import cors, { CorsOptions } from "cors";
import { RouteDependencies, createApiRouter } from "./routes/api.routes";
import { errorHandler } from "./middlewares/error.middleware";

export interface ServerOptions {
  corsOrigin?: string;
}

export function createServer(deps: RouteDependencies, options?: ServerOptions): Express {
  const app = express();

  const allowedOrigins = options?.corsOrigin
    ? options.corsOrigin
        .split(",")
        .map((o) => o.trim().replace(/\/+$/, ""))
        .filter((o) => o.length > 0)
    : [];

  const corsOptions: CorsOptions = {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      const normalizedRequestOrigin = requestOrigin.replace(/\/+$/, "");

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === normalizedRequestOrigin) {
          return true;
        }
        if (allowed.startsWith("*.") && normalizedRequestOrigin.endsWith(allowed.slice(1))) {
          return true;
        }
        if (normalizedRequestOrigin.includes("vercel.app") && allowed.includes("vercel.app")) {
          return true;
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", createApiRouter(deps));
  app.use(errorHandler);

  return app;
}
