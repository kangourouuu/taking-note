import { z } from "zod";

export const RegisterRequestSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(6).max(100)
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  username: z.string().min(1).trim(),
  password: z.string().min(1)
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;

export interface UserResponseDto {
  id: string;
  username: string;
  createdAt: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserResponseDto;
}
