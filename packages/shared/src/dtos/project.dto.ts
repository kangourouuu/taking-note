import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  description: z.string().max(1000).optional()
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(150).trim().optional(),
  description: z.string().max(1000).optional()
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;

export interface ProjectResponseDto {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
