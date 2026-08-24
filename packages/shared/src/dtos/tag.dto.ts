import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  projectId: z.string().uuid().optional()
});

export type CreateTagDto = z.infer<typeof CreateTagSchema>;

export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  projectId: z.string().uuid().nullable().optional()
});

export type UpdateTagDto = z.infer<typeof UpdateTagSchema>;

export interface TagResponseDto {
  id: string;
  userId: string;
  projectId: string | null;
  name: string;
  colorHex: string;
  createdAt: string;
  updatedAt: string;
}
