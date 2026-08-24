import { and, eq } from "drizzle-orm";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { DatabaseInstance } from "../database/connection";
import { projectsTable } from "../database/schema";

export class ProjectRepository implements IProjectRepository {
  constructor(private readonly db: DatabaseInstance) {}

  public async findById(id: string, userId: string): Promise<Project | null> {
    const records = await this.db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
      .limit(1);
    const record = records[0];
    if (!record) {
      return null;
    }
    return new Project(record.id, record.userId, record.name, record.description, record.createdAt, record.updatedAt);
  }

  public async findByUserId(userId: string): Promise<Project[]> {
    const records = await this.db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(projectsTable.createdAt);
    return records.map(
      (r) => new Project(r.id, r.userId, r.name, r.description, r.createdAt, r.updatedAt)
    );
  }

  public async save(project: Project): Promise<Project> {
    await this.db.insert(projectsTable).values({
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    });
    return project;
  }

  public async update(project: Project): Promise<Project> {
    await this.db
      .update(projectsTable)
      .set({
        name: project.name,
        description: project.description,
        updatedAt: project.updatedAt
      })
      .where(and(eq(projectsTable.id, project.id), eq(projectsTable.userId, project.userId)));
    return project;
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }
}
