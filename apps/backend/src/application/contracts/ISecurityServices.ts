export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface IJwtService {
  sign(payload: { userId: string; username: string }): string;
  verify(token: string): { userId: string; username: string };
}
