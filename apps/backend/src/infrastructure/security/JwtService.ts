import jwt from "jsonwebtoken";
import { AUTH_TOKEN_EXPIRY } from "@taking-note/shared";
import { IJwtService } from "../../application/contracts/ISecurityServices";
import { UnauthorizedError } from "../../domain/errors/DomainErrors";

interface TokenPayload {
  userId: string;
  username: string;
}

export class JwtService implements IJwtService {
  constructor(private readonly secret: string) {}

  public sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: AUTH_TOKEN_EXPIRY
    });
  }

  public verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;
      if (typeof decoded === "object" && decoded !== null && "userId" in decoded && "username" in decoded) {
        return {
          userId: String(decoded["userId"]),
          username: String(decoded["username"])
        };
      }
      throw new UnauthorizedError("Invalid token payload structure");
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }
  }
}
