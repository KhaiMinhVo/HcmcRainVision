/**
 * Auth API: login, register, me, forgot-password, reset-password, updateProfile, changePassword
 */
import { apiPost, apiGet, apiPut } from './apiClient';
import type {
  LoginDto,
  LoginResponse,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UserProfileDto,
} from '../types/api';

export async function login(body: LoginDto): Promise<LoginResponse> {
  return apiPost<LoginResponse>('api/Auth/login', body);
}

export async function register(body: RegisterDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/Auth/register', body);
}

export async function getMe(): Promise<UserProfileDto> {
  return apiGet<UserProfileDto>('api/Auth/me');
}

export async function forgotPassword(body: ForgotPasswordDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/Auth/forgot-password', body);
}

export async function resetPassword(body: ResetPasswordDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/Auth/reset-password', body);
}

export async function updateProfile(body: UpdateProfileDto): Promise<{ message: string }> {
  return apiPut<{ message: string }>('api/Auth/me', body);
}

export async function changePassword(body: ChangePasswordDto): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/Auth/change-password', body);
}

export async function updateLocation(body: { Latitude: number; Longitude: number }): Promise<{ message: string }> {
  return apiPost<{ message: string }>('api/Auth/location', body);
}
