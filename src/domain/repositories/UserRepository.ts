import type { RegisterRequest, LoginRequest, AuthResponse, User } from '../entities/User';

export interface UserRepository {
    register(request: RegisterRequest): Promise<User>;
    login(request: LoginRequest): Promise<AuthResponse>;
    getCurrentUser(): Promise<User>;
}