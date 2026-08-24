import { Tag } from "../entities/Tag";

export interface ITagRepository {
  findById(id: string, userId: string): Promise<Tag | null>;
  findByIds(ids: readonly string[], userId: string): Promise<Tag[]>;
  findByUserId(userId: string, projectId?: string): Promise<Tag[]>;
  save(tag: Tag): Promise<Tag>;
  update(tag: Tag): Promise<Tag>;
  delete(id: string, userId: string): Promise<boolean>;
}
