import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { User } from "../src/domain/entities/User";
import { Project } from "../src/domain/entities/Project";
import { Tag } from "../src/domain/entities/Tag";
import { Note } from "../src/domain/entities/Note";
import { IUserRepository } from "../src/domain/repositories/IUserRepository";
import { IProjectRepository } from "../src/domain/repositories/IProjectRepository";
import { ITagRepository } from "../src/domain/repositories/ITagRepository";
import { INoteRepository, NoteFilterCriteria } from "../src/domain/repositories/INoteRepository";
import { AuthService } from "../src/application/services/AuthService";
import { ProjectService } from "../src/application/services/ProjectService";
import { TagService } from "../src/application/services/TagService";
import { NoteService } from "../src/application/services/NoteService";
import { BcryptPasswordHasher } from "../src/infrastructure/security/PasswordHasher";
import { JwtService } from "../src/infrastructure/security/JwtService";

class InMemoryUserRepository implements IUserRepository {
  private users = new Map<string, User>();

  public async findById(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.username === username) {
        return u;
      }
    }
    return null;
  }

  public async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}

class InMemoryProjectRepository implements IProjectRepository {
  private projects = new Map<string, Project>();

  public async findById(id: string, userId: string): Promise<Project | null> {
    const project = this.projects.get(id);
    if (project && project.userId === userId) {
      return project;
    }
    return null;
  }

  public async findByUserId(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter((p) => p.userId === userId);
  }

  public async save(project: Project): Promise<Project> {
    this.projects.set(project.id, project);
    return project;
  }

  public async update(project: Project): Promise<Project> {
    this.projects.set(project.id, project);
    return project;
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const project = this.projects.get(id);
    if (project && project.userId === userId) {
      this.projects.delete(id);
      return true;
    }
    return false;
  }
}

class InMemoryTagRepository implements ITagRepository {
  private tags = new Map<string, Tag>();

  public async findById(id: string, userId: string): Promise<Tag | null> {
    const tag = this.tags.get(id);
    if (tag && tag.userId === userId) {
      return tag;
    }
    return null;
  }

  public async findByIds(ids: readonly string[], userId: string): Promise<Tag[]> {
    const result: Tag[] = [];
    for (const id of ids) {
      const tag = this.tags.get(id);
      if (tag && tag.userId === userId) {
        result.push(tag);
      }
    }
    return result;
  }

  public async findByUserId(userId: string, projectId?: string): Promise<Tag[]> {
    return Array.from(this.tags.values()).filter((t) => {
      if (t.userId !== userId) {
        return false;
      }
      if (projectId && t.projectId !== projectId) {
        return false;
      }
      return true;
    });
  }

  public async save(tag: Tag): Promise<Tag> {
    this.tags.set(tag.id, tag);
    return tag;
  }

  public async update(tag: Tag): Promise<Tag> {
    this.tags.set(tag.id, tag);
    return tag;
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const tag = this.tags.get(id);
    if (tag && tag.userId === userId) {
      this.tags.delete(id);
      return true;
    }
    return false;
  }
}

class InMemoryNoteRepository implements INoteRepository {
  private notes = new Map<string, Note>();

  public async findById(id: string, userId: string): Promise<Note | null> {
    const note = this.notes.get(id);
    if (note && note.userId === userId) {
      return note;
    }
    return null;
  }

  public async findMany(criteria: NoteFilterCriteria): Promise<Note[]> {
    return Array.from(this.notes.values()).filter((n) => {
      if (n.userId !== criteria.userId) {
        return false;
      }
      if (criteria.projectId && n.projectId !== criteria.projectId) {
        return false;
      }
      if (criteria.month && !n.noteDate.startsWith(criteria.month)) {
        return false;
      }
      if (criteria.tagIds && criteria.tagIds.length > 0) {
        const noteTagIds = n.tags.map((t) => t.id);
        const hasMatchingTag = criteria.tagIds.some((tId) => noteTagIds.includes(tId));
        if (!hasMatchingTag) {
          return false;
        }
      }
      return true;
    });
  }

  public async save(note: Note): Promise<Note> {
    this.notes.set(note.id, note);
    return note;
  }

  public async update(note: Note): Promise<Note> {
    this.notes.set(note.id, note);
    return note;
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const note = this.notes.get(id);
    if (note && note.userId === userId) {
      this.notes.delete(id);
      return true;
    }
    return false;
  }
}

async function runTests(): Promise<void> {
  const userRepo = new InMemoryUserRepository();
  const projectRepo = new InMemoryProjectRepository();
  const tagRepo = new InMemoryTagRepository();
  const noteRepo = new InMemoryNoteRepository();

  const passwordHasher = new BcryptPasswordHasher();
  const jwtService = new JwtService("test_secret_key_12345678901234567890123456789012");

  const authService = new AuthService(userRepo, passwordHasher, jwtService);
  const projectService = new ProjectService(projectRepo);
  const tagService = new TagService(tagRepo, projectRepo);
  const noteService = new NoteService(noteRepo, tagRepo, projectRepo);

  const authA = await authService.register({ username: "user_a", password: "password123" });
  assert.equal(authA.user.username, "user_a");
  assert.ok(authA.token.length > 0);

  const authB = await authService.register({ username: "user_b", password: "password456" });
  assert.equal(authB.user.username, "user_b");
  assert.ok(authB.token.length > 0);

  const projectA = await projectService.createProject(authA.user.id, {
    name: "Project A",
    description: "User A project"
  });
  assert.equal(projectA.name, "Project A");

  const projectB = await projectService.createProject(authB.user.id, {
    name: "Project B",
    description: "User B project"
  });
  assert.equal(projectB.name, "Project B");

  const userAProjects = await projectService.getProjects(authA.user.id);
  assert.equal(userAProjects.length, 1);
  assert.equal(userAProjects[0]?.id, projectA.id);

  const userBProjects = await projectService.getProjects(authB.user.id);
  assert.equal(userBProjects.length, 1);
  assert.equal(userBProjects[0]?.id, projectB.id);

  const tagA = await tagService.createTag(authA.user.id, {
    name: "Urgent",
    colorHex: "#EF4444",
    projectId: projectA.id
  });
  assert.equal(tagA.name, "Urgent");
  assert.equal(tagA.colorHex, "#EF4444");
  assert.equal(tagA.projectId, projectA.id);

  const projectATags = await tagService.getTags(authA.user.id, projectA.id);
  assert.equal(projectATags.length, 1);
  assert.equal(projectATags[0]?.id, tagA.id);

  const noteA = await noteService.createNote(authA.user.id, {
    projectId: projectA.id,
    title: "Launch Planning",
    summary: "August milestone review",
    content: "Review sprint deliverables and prepare demo.",
    noteDate: "2026-08-24",
    tagIds: [tagA.id]
  });

  assert.equal(noteA.title, "Launch Planning");
  assert.equal(noteA.noteDate, "2026-08-24");
  assert.equal(noteA.tags.length, 1);
  assert.equal(noteA.tags[0]?.name, "Urgent");

  const userANotes = await noteService.getNotes(authA.user.id, {
    month: "2026-08",
    projectId: projectA.id
  });
  assert.equal(userANotes.length, 1);
  assert.equal(userANotes[0]?.id, noteA.id);

  const userBNotes = await noteService.getNotes(authB.user.id, {
    month: "2026-08"
  });
  assert.equal(userBNotes.length, 0);

  const filteredByTag = await noteService.getNotes(authA.user.id, {
    tagIds: tagA.id
  });
  assert.equal(filteredByTag.length, 1);

  const filteredByNonExistentTag = await noteService.getNotes(authA.user.id, {
    tagIds: randomUUID()
  });
  assert.equal(filteredByNonExistentTag.length, 0);

  console.log("All unit and layer tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
