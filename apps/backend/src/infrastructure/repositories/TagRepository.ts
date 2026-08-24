import { and, eq, inArray } from "drizzle-orm";
import { ITagRepository } from "../../domain/repositories/ITagRepository";
import { Tag } from "../../domain/entities/Tag";
import { DatabaseInstance } from "../database/connection";
import { tagsTable } from "../database/schema";

export class TagRepository implements ITagRepository {
  constructor(private readonly db: DatabaseInstance) {}

  public async findById(id: string, userId: string): Promise<Tag | null> {
    const records = await this.db
      .select()
      .from(tagsTable)
      .where(and(eq(tagsTable.id, id), eq(tagsTable.userId, userId)))
      .limit(1);
    const record = records[0];
    if (!record) {
      return null;
    }
    return new Tag(record.id, record.userId, record.projectId, record.name, record.colorHex, record.createdAt, record.updatedAt);
  }

  public async findByIds(ids: readonly string[], userId: string): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }
    const records = await this.db
      .select()
      .from(tagsTable)
      .where(and(inArray(tagsTable.id, [...ids]), eq(tagsTable.userId, userId)));
    return records.map(
      (r) => new Tag(r.id, r.userId, r.projectId, r.name, r.colorHex, r.createdAt, r.updatedAt)
    );
  }

  public async findByUserId(userId: string, projectId?: string): Promise<Tag[]> {
    const conditions = [eq(tagsTable.userId, userId)];
    if (projectId) {
      conditions.push(eq(tagsTable.projectId, projectId));
    }

    const records = await this.db
      .select()
      .from(tagsTable)
      .where(and(...conditions))
      .orderBy(tagsTable.createdAt);

    return records.map(
      (r) => new Tag(r.id, r.userId, r.projectId, r.name, r.colorHex, r.createdAt, r.updatedAt)
    );
  }

  public async save(tag: Tag): Promise<Tag> {
    await this.db.insert(tagsTable).values({
      id: tag.id,
      userId: tag.userId,
      projectId: tag.projectId,
      name: tag.name,
      colorHex: tag.colorHex,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt
    });
    return tag;
  }

  public async update(tag: Tag): Promise<Tag> {
    await this.db
      .update(tagsTable)
      .set({
        projectId: tag.projectId,
        name: tag.name,
        colorHex: tag.colorHex,
        updatedAt: tag.updatedAt
      })
      .where(and(eq(tagsTable.id, tag.id), eq(tagsTable.userId, tag.userId)));
    return tag;
  }

  public async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.db
      .delete(tagsTable)
      .where(and(eq(tagsTable.id, id), eq(tagsTable.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }
}
