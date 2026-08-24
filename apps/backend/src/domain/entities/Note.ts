import { Tag } from "./Tag";

export class Note {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly projectId: string,
    public readonly title: string,
    public readonly summary: string | null,
    public readonly content: string,
    public readonly noteDate: string,
    public readonly tags: readonly Tag[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    userId: string,
    projectId: string,
    title: string,
    summary: string | null,
    content: string,
    noteDate: string,
    tags: readonly Tag[]
  ): Note {
    const now = new Date();
    return new Note(id, userId, projectId, title, summary, content, noteDate, tags, now, now);
  }
}
