export class Project {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(id: string, userId: string, name: string, description?: string): Project {
    const now = new Date();
    return new Project(id, userId, name, description ?? null, now, now);
  }
}
