import type { UserRepository } from '../../domain/repositories/UserRepository';
import type { RegisterRequest, LoginRequest, User } from '../../domain/entities/User';

export class AuthUseCase {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async register(request: RegisterRequest): Promise<User> {
        if (!request.username.trim()) {
            throw new Error('Username is required');
        }
        if (!request.email.trim()) {
            throw new Error('Email is required')
        }
        if (!request.password.trim()) {
            throw new Error('Password is required');
        }
        if (request.password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const emailRegex = /^[^\s@]+@[^s\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(request.email)) {
            throw new Error('Be more creative!')
        }

        return this.userRepository.register(request);
    }

    async login(request: LoginRequest): Promise<void> {
        if (!request.email.trim()) {
            throw new Error('Email is required');
        }
        if (!request.password.trim()) {
            throw new Error('Password is required');
        }

        await this.userRepository.login(request);
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            return await this.userRepository.getCurrentUser();
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
}