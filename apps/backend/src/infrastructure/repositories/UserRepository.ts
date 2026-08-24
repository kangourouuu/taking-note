import { eq } from "drizzle-orm";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { DatabaseInstance } from "../database/connection";
import { usersTable } from "../database/schema";

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DatabaseInstance) {}

  public async findById(id: string): Promise<User | null> {
    const records = await this.db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    const record = records[0];
    if (!record) {
      return null;
    }
    return new User(record.id, record.username, record.passwordHash, record.createdAt, record.updatedAt);
  }

  public async findByUsername(username: string): Promise<User | null> {
    const records = await this.db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    const record = records[0];
    if (!record) {
      return null;
    }
    return new User(record.id, record.username, record.passwordHash, record.createdAt, record.updatedAt);
  }

  public async save(user: User): Promise<User> {
    await this.db.insert(usersTable).values({
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
    return user;
  }
}
