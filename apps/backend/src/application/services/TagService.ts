import { randomUUID } from "crypto";
import { CreateTagDto, UpdateTagDto, TagResponseDto } from "@taking-note/shared";
import { ITagRepository } from "../../domain/repositories/ITagRepository";
import { Tag } from "../../domain/entities/Tag";
import { NotFoundError } from "../../domain/errors/DomainErrors";

export class TagService {
  constructor(private readonly tagRepository: ITagRepository) {}

  public async getTags(userId: string, projectId?: string): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.findByUserId(userId, projectId);
    return tags.map((t) => this.mapToDto(t));
  }

  public async getTagById(id: string, userId: string): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findById(id, userId);
    if (!tag) {
      throw new NotFoundError("Tag", id);
    }
    return this.mapToDto(tag);
  }

  public async createTag(userId: string, dto: CreateTagDto): Promise<TagResponseDto> {
    const tagId = randomUUID();
    const tag = Tag.create(tagId, userId, dto.name, dto.colorHex, dto.projectId);
    const saved = await this.tagRepository.save(tag);
    return this.mapToDto(saved);
  }

  public async updateTag(id: string, userId: string, dto: UpdateTagDto): Promise<TagResponseDto> {
    const existing = await this.tagRepository.findById(id, userId);
    if (!existing) {
      throw new NotFoundError("Tag", id);
    }

    const updated = new Tag(
      existing.id,
      existing.userId,
      dto.projectId !== undefined ? dto.projectId : existing.projectId,
      dto.name !== undefined ? dto.name : existing.name,
      dto.colorHex !== undefined ? dto.colorHex : existing.colorHex,
      existing.createdAt,
      new Date()
    );

    const saved = await this.tagRepository.update(updated);
    return this.mapToDto(saved);
  }

  public async deleteTag(id: string, userId: string): Promise<void> {
    const deleted = await this.tagRepository.delete(id, userId);
    if (!deleted) {
      throw new NotFoundError("Tag", id);
    }
  }

  private mapToDto(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      userId: tag.userId,
      projectId: tag.projectId,
      name: tag.name,
      colorHex: tag.colorHex,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString()
    };
  }
}
