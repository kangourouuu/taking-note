import { z } from "zod";
import { TagResponseDto } from "./tag.dto";

export const CreateNoteSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255).trim(),
  summary: z.string().max(500).optional(),
  content: z.string(),
  noteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tagIds: z.array(z.string().uuid()).optional().default([])
});

export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;

export const UpdateNoteSchema = z.object({
  projectId: z.string().uuid().optional(),
  title: z.string().min(1).max(255).trim().optional(),
  summary: z.string().max(500).optional(),
  content: z.string().optional(),
  noteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tagIds: z.array(z.string().uuid()).optional()
});

export type UpdateNoteDto = z.infer<typeof UpdateNoteSchema>;

export const NoteFilterQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  tagIds: z.string().optional()
});

export type NoteFilterQueryDto = z.infer<typeof NoteFilterQuerySchema>;

export interface NoteResponseDto {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  summary: string | null;
  content: string;
  noteDate: string;
  tags: TagResponseDto[];
  createdAt: string;
  updatedAt: string;
}
