import { request } from "./client";
import { CreateNoteDto, UpdateNoteDto, NoteFilterQueryDto, NoteResponseDto } from "@taking-note/shared";

export const notesApi = {
  getAll: (filter: NoteFilterQueryDto): Promise<NoteResponseDto[]> => {
    const params = new URLSearchParams();
    if (filter.projectId) params.set("projectId", filter.projectId);
    if (filter.month) params.set("month", filter.month);
    if (filter.tagIds) params.set("tagIds", filter.tagIds);

    const queryString = params.toString();
    return request<NoteResponseDto[]>(`/notes${queryString ? `?${queryString}` : ""}`);
  },

  getById: (id: string): Promise<NoteResponseDto> => request<NoteResponseDto>(`/notes/${id}`),

  create: (dto: CreateNoteDto): Promise<NoteResponseDto> =>
    request<NoteResponseDto>("/notes", {
      method: "POST",
      body: JSON.stringify(dto)
    }),

  update: (id: string, dto: UpdateNoteDto): Promise<NoteResponseDto> =>
    request<NoteResponseDto>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto)
    }),

  delete: (id: string): Promise<void> =>
    request<void>(`/notes/${id}`, {
      method: "DELETE"
    })
};
