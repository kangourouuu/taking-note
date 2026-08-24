export class Tag {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly projectId: string | null,
    public readonly name: string,
    public readonly colorHex: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(id: string, userId: string, name: string, colorHex: string, projectId?: string | null): Tag {
    const now = new Date();
    return new Tag(id, userId, projectId ?? null, name, colorHex, now, now);
  }
}
