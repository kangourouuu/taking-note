export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(id: string, username: string, passwordHash: string): User {
    const now = new Date();
    return new User(id, username, passwordHash, now, now);
  }
}
