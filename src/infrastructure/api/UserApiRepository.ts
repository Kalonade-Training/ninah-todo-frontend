import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '../../domain/entities/User';
import { apiClient } from './ApiClient';

export class UserApiRepository implements UserRepository {
    async register(request: RegisterRequest): Promise<User> {
        const response = await apiClient.post<{id: string; email: string}>('/register', request);
        return {
            id: response.id, 
            email: response.email,
        };
    }
    async login(request: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<AuthResponse>('/login', request);
        localStorage.setItem('token', response.token);
        return response;
    }
    async getCurrentUser(): Promise<User> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.user_id, 
                email: payload.email || '', 
            };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}