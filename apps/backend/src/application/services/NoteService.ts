import { randomUUID } from "crypto";
import { CreateNoteDto, UpdateNoteDto, NoteFilterQueryDto, NoteResponseDto } from "@taking-note/shared";
import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { ITagRepository } from "../../domain/repositories/ITagRepository";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Note } from "../../domain/entities/Note";
import { NotFoundError } from "../../domain/errors/DomainErrors";

export class NoteService {
  constructor(
    private readonly noteRepository: INoteRepository,
    private readonly tagRepository: ITagRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  public async getNotes(userId: string, filter: NoteFilterQueryDto): Promise<NoteResponseDto[]> {
    const tagIds = filter.tagIds ? filter.tagIds.split(",").filter((id) => id.length > 0) : undefined;
    const notes = await this.noteRepository.findMany({
      userId,
      projectId: filter.projectId,
      month: filter.month,
      tagIds
    });

    return notes.map((n) => this.mapToDto(n));
  }

  public async getNoteById(id: string, userId: string): Promise<NoteResponseDto> {
    const note = await this.noteRepository.findById(id, userId);
    if (!note) {
      throw new NotFoundError("Note", id);
    }
    return this.mapToDto(note);
  }

  public async createNote(userId: string, dto: CreateNoteDto): Promise<NoteResponseDto> {
    const project = await this.projectRepository.findById(dto.projectId, userId);
    if (!project) {
      throw new NotFoundError("Project", dto.projectId);
    }

    const tags = dto.tagIds && dto.tagIds.length > 0
      ? await this.tagRepository.findByIds(dto.tagIds, userId)
      : [];

    const noteId = randomUUID();
    const note = Note.create(
      noteId,
      userId,
      dto.projectId,
      dto.title,
      dto.summary ?? null,
      dto.content,
      dto.noteDate,
      tags
    );

    const saved = await this.noteRepository.save(note);
    return this.mapToDto(saved);
  }

  public async updateNote(id: string, userId: string, dto: UpdateNoteDto): Promise<NoteResponseDto> {
    const existing = await this.noteRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Note", id);
    }

    if (dto.projectId && dto.projectId !== existing.projectId) {
      const project = await this.projectRepository.findById(dto.projectId, userId);
      if (!project) {
        throw new NotFoundError("Project", dto.projectId);
      }
    }

    const tags = dto.tagIds !== undefined
      ? await this.tagRepository.findByIds(dto.tagIds, userId)
      : existing.tags;

    const updated = new Note(
      existing.id,
      existing.userId,
      dto.projectId !== undefined ? dto.projectId : existing.projectId,
      dto.title !== undefined ? dto.title : existing.title,
      dto.summary !== undefined ? dto.summary : existing.summary,
      dto.content !== undefined ? dto.content : existing.content,
      dto.noteDate !== undefined ? dto.noteDate : existing.noteDate,
      tags,
      existing.createdAt,
      new Date()
    );

    const saved = await this.noteRepository.update(updated);
    return this.mapToDto(saved);
  }

  public async deleteNote(id: string, userId: string): Promise<void> {
    const deleted = await this.noteRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Note", id);
    }
  }

  private mapToDto(note: Note): NoteResponseDto {
    return {
      id: note.id,
      userId: note.userId,
      projectId: note.projectId,
      title: note.title,
      summary: note.summary,
      content: note.content,
      noteDate: note.noteDate,
      tags: note.tags.map((t) => ({
        id: t.id,
        userId: t.userId,
        projectId: t.projectId,
        name: t.name,
        colorHex: t.colorHex,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
      })),
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    };
  }
}
