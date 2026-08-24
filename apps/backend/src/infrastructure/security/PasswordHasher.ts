import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../../application/contracts/ISecurityServices";

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds = 10;

  public async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
