import dotenv from "dotenv";
import { createDatabaseConnection, initializeDatabaseTables } from "./infrastructure/database/connection";
import { BcryptPasswordHasher } from "./infrastructure/security/PasswordHasher";
import { JwtService } from "./infrastructure/security/JwtService";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { ProjectRepository } from "./infrastructure/repositories/ProjectRepository";
import { TagRepository } from "./infrastructure/repositories/TagRepository";
import { NoteRepository } from "./infrastructure/repositories/NoteRepository";
import { AuthService } from "./application/services/AuthService";
import { ProjectService } from "./application/services/ProjectService";
import { TagService } from "./application/services/TagService";
import { NoteService } from "./application/services/NoteService";
import { AuthController } from "./presentation/controllers/AuthController";
import { ProjectController } from "./presentation/controllers/ProjectController";
import { TagController } from "./presentation/controllers/TagController";
import { NoteController } from "./presentation/controllers/NoteController";
import { createServer } from "./presentation/server";

dotenv.config();

const port = Number(process.env["PORT"] ?? 4000);
const secret = process.env["APP_SECRET"] ?? "taking_note_master_jwt_secret_key_minimum_32_characters_long_1234567890";
const databaseUrl = process.env["DATABASE_URL"] ?? "postgresql://postgres:postgres@localhost:5432/taking_note?sslmode=disable";
const corsOrigin = process.env["CORS_ORIGIN"];

async function main(): Promise<void> {
  const { db, pool } = createDatabaseConnection(databaseUrl);

  try {
    await initializeDatabaseTables(pool);
  } catch (err) {
    console.error("Database table initialization notice:", err);
  }

  const passwordHasher = new BcryptPasswordHasher();
  const jwtService = new JwtService(secret);

  const userRepository = new UserRepository(db);
  const projectRepository = new ProjectRepository(db);
  const tagRepository = new TagRepository(db);
  const noteRepository = new NoteRepository(db);

  const authService = new AuthService(userRepository, passwordHasher, jwtService);
  const projectService = new ProjectService(projectRepository);
  const tagService = new TagService(tagRepository, projectRepository);
  const noteService = new NoteService(noteRepository, tagRepository, projectRepository);

  const authController = new AuthController(authService);
  const projectController = new ProjectController(projectService);
  const tagController = new TagController(tagService);
  const noteController = new NoteController(noteService);

  const app = createServer(
    {
      authController,
      projectController,
      tagController,
      noteController,
      jwtService
    },
    {
      corsOrigin
    }
  );

  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
