import { request } from "./client";
import { CreateTagDto, UpdateTagDto, TagResponseDto } from "@taking-note/shared";

export const tagsApi = {
  getAll: (projectId?: string): Promise<TagResponseDto[]> => {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    return request<TagResponseDto[]>(`/tags${query}`);
  },

  getById: (id: string): Promise<TagResponseDto> => request<TagResponseDto>(`/tags/${id}`),

  create: (dto: CreateTagDto): Promise<TagResponseDto> =>
    request<TagResponseDto>("/tags", {
      method: "POST",
      body: JSON.stringify(dto)
    }),

  update: (id: string, dto: UpdateTagDto): Promise<TagResponseDto> =>
    request<TagResponseDto>(`/tags/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto)
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/tags/${id}`, {
      method: "DELETE"
    })
};
