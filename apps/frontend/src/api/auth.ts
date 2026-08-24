import { request } from "./client";
import { RegisterRequestDto, LoginRequestDto, AuthResponseDto, UserResponseDto } from "@taking-note/shared";

export const authApi = {
  register: (dto: RegisterRequestDto): Promise<AuthResponseDto> =>
    request<AuthResponseDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto)
    }),

  login: (dto: LoginRequestDto): Promise<AuthResponseDto> =>
    request<AuthResponseDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto)
    }),

  getMe: (): Promise<UserResponseDto> => request<UserResponseDto>("/auth/me")
};
