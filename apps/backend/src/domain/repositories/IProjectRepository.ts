import { Project } from "../entities/Project";

export interface IProjectRepository {
  findById(id: string, userId: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  save(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string, userId: string): Promise<boolean>;
}
