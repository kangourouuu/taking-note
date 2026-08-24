import { request } from "./client";
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto } from "@taking-note/shared";

export const projectsApi = {
  getAll: (): Promise<ProjectResponseDto[]> => request<ProjectResponseDto[]>("/projects"),

  getById: (id: string): Promise<ProjectResponseDto> => request<ProjectResponseDto>(`/projects/${id}`),

  create: (dto: CreateProjectDto): Promise<ProjectResponseDto> =>
    request<ProjectResponseDto>("/projects", {
      method: "POST",
      body: JSON.stringify(dto)
    }),

  update: (id: string, dto: UpdateProjectDto): Promise<ProjectResponseDto> =>
    request<ProjectResponseDto>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto)
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/projects/${id}`, {
      method: "DELETE"
    })
};
