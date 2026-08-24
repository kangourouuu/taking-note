import { randomUUID } from "crypto";
import { RegisterRequestDto, LoginRequestDto, AuthResponseDto, UserResponseDto } from "@taking-note/shared";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../domain/errors/DomainErrors";
import { IJwtService, IPasswordHasher } from "../contracts/ISecurityServices";

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtService: IJwtService
  ) {}

  public async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByUsername(dto.username);
    if (existing) {
      throw new ConflictError(`Username ${dto.username} is already taken`);
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const userId = randomUUID();
    const newUser = User.create(userId, dto.username, passwordHash);
    const savedUser = await this.userRepository.save(newUser);

    const token = this.jwtService.sign({
      userId: savedUser.id,
      username: savedUser.username
    });

    return {
      token,
      user: {
        id: savedUser.id,
        username: savedUser.username,
        createdAt: savedUser.createdAt.toISOString()
      }
    };
  }

  public async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const isValid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const token = this.jwtService.sign({
      userId: user.id,
      username: user.username
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.toISOString()
      }
    };
  }

  public async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt.toISOString()
    };
  }
}
