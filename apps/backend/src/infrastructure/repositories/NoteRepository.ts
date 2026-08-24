import { and, eq, inArray, like, SQL } from "drizzle-orm";
import { INoteRepository, NoteFilterCriteria } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/entities/Note";
import { Tag } from "../../domain/entities/Tag";
import { DatabaseInstance } from "../database/connection";
import { notesTable, noteTagsTable, tagsTable } from "../database/schema";

export class NoteRepository implements INoteRepository {
  constructor(private readonly db: DatabaseInstance) {}

  public async findById(id: string, userId: string): Promise<Note | null> {
    const noteRecords = await this.db
      .select()
      .from(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)))
      .limit(1);

    const record = noteRecords[0];
    if (!record) {
      return null;
    }

    const tags = await this.getTagsForNote(record.id);

    return new Note(
      record.id,
      record.userId,
      record.projectId,
      record.title,
      record.summary,
      record.content,
      record.noteDate,
      tags,
      record.createdAt,
      record.updatedAt
    );
  }

  public async findMany(criteria: NoteFilterCriteria): Promise<Note[]> {
    const conditions: SQL[] = [eq(notesTable.userId, criteria.userId)];

    if (criteria.projectId) {
      conditions.push(eq(notesTable.projectId, criteria.projectId));
    }

    if (criteria.month) {
      conditions.push(like(notesTable.noteDate, `${criteria.month}-%`));
    }

    if (criteria.tagIds && criteria.tagIds.length > 0) {
      const matchingNoteTags = await this.db
        .select({ noteId: noteTagsTable.noteId })
        .from(noteTagsTable)
        .where(inArray(noteTagsTable.tagId, [...criteria.tagIds]));

      const noteIds = matchingNoteTags.map((nt) => nt.noteId);
      if (noteIds.length === 0) {
        return [];
      }
      conditions.push(inArray(notesTable.id, noteIds));
    }

    const records = await this.db
      .select()
      .from(notesTable)
      .where(and(...conditions))
      .orderBy(notesTable.noteDate, notesTable.createdAt);

    if (records.length === 0) {
      return [];
    }

    const allNoteIds = records.map((r) => r.id);
    const tagMappings = await this.db
      .select({
        noteId: noteTagsTable.noteId,
        tag: tagsTable
      })
      .from(noteTagsTable)
      .innerJoin(tagsTable, eq(noteTagsTable.tagId, tagsTable.id))
      .where(inArray(noteTagsTable.noteId, allNoteIds));

    const tagsByNoteId = new Map<string, Tag[]>();
    for (const mapping of tagMappings) {
      const existingList = tagsByNoteId.get(mapping.noteId) ?? [];
      existingList.push(
        new Tag(
          mapping.tag.id,
          mapping.tag.userId,
          mapping.tag.projectId,
          mapping.tag.name,
          mapping.tag.colorHex,
          mapping.tag.createdAt,
          mapping.tag.updatedAt
        )
      );
      tagsByNoteId.set(mapping.noteId, existingList);
    }

    return records.map(
      (r) =>
        new Note(
          r.id,
          r.userId,
          r.projectId,
          r.title,
          r.summary,
          r.content,
          r.noteDate,
          tagsByNoteId.get(r.id) ?? [],
          r.createdAt,
          r.updatedAt
        )
    );
  }

  public async save(note: Note): Promise<Note> {
    await this.db.insert(notesTable).values({
      id: note.id,
      userId: note.userId,
      projectId: note.projectId,
      title: note.title,
      summary: note.summary,
      content: note.content,
      noteDate: note.noteDate,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    });

    if (note.tags.length > 0) {
      await this.db.insert(noteTagsTable).values(
        note.tags.map((t) => ({
          noteId: note.id,
          tagId: t.id
        }))
      );
    }

    return note;
  }

  public async update(note: Note): Promise<Note> {
    await this.db
      .update(notesTable)
      .set({
        projectId: note.projectId,
        title: note.title,
        summary: note.summary,
        content: note.content,
        noteDate: note.noteDate,
        updatedAt: note.updatedAt
      })
      .where(and(eq(notesTable.id, note.id), eq(notesTable.userId, note.userId)));

    await this.db.delete(noteTagsTable).where(eq(noteTagsTable.noteId, note.id));

    if (note.tags.length > 0) {
      await this.db.insert(noteTagsTable).values(
        note.tags.map((t) => ({
          noteId: note.id,
          tagId: t.id
        }))
      );
    }

    return note;
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(notesTable)
      .where(and(eq(notesTable.id, id), eq(notesTable.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  private async getTagsForNote(noteId: string): Promise<Tag[]> {
    const mappings = await this.db
      .select({ tag: tagsTable })
      .from(noteTagsTable)
      .innerJoin(tagsTable, eq(noteTagsTable.tagId, tagsTable.id))
      .where(eq(noteTagsTable.noteId, noteId));

    return mappings.map(
      (m) =>
        new Tag(
          m.tag.id,
          m.tag.userId,
          m.tag.projectId,
          m.tag.name,
          m.tag.colorHex,
          m.tag.createdAt,
          m.tag.updatedAt
        )
    );
  }
}
