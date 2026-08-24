import { Note } from "../entities/Note";

export interface NoteFilterCriteria {
  userId: string;
  projectId?: string;
  month?: string;
  tagIds?: readonly string[];
}

export interface INoteRepository {
  findById(id: string, userId: string): Promise<Note | null>;
  findMany(criteria: NoteFilterCriteria): Promise<Note[]>;
  save(note: Note): Promise<Note>;
  update(note: Note): Promise<Note>;
  delete(id: string, userId: string): Promise<boolean>;
}
