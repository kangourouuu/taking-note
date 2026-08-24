import { randomUUID } from "crypto";
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from "@taking-note/shared";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Project } from "../../domain/entities/Project";
import { NotFoundError } from "../../domain/errors/DomainErrors";

export class ProjectService {
  constructor(private readonly projectRepository: IProjectRepository) {}

  public async getProjects(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.findByUserId(userId);
    return projects.map((p) => this.mapToDto(p));
  }

  public async getProjectById(id: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(id, userId);
    if (!project) {
      throw new NotFoundError("Project", id);
    }
    return this.mapToDto(project);
  }

  public async createProject(userId: string, dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const projectId = randomUUID();
    const project = Project.create(projectId, userId, dto.name, dto.description);
    const saved = await this.projectRepository.save(project);
    return this.mapToDto(saved);
  }

  public async updateProject(id: string, userId: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const existing = await this.projectRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Project", id);
    }

    const updated = new Project(
      existing.id,
      existing.userId,
      dto.name !== undefined ? dto.name : existing.name,
      dto.description !== undefined ? dto.description : existing.description,
      existing.createdAt,
      new Date()
    );

    const saved = await this.projectRepository.update(updated);
    return this.mapToDto(saved);
  }

  public async deleteProject(id: string, userId: string): Promise<void> {
    const deleted = await this.projectRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Project", id);
    }
  }

  private mapToDto(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };
  }
}
