export interface AuthRepository {
    login(email: string, password: string): Promise<{ token: string }>;
    register(email: string, username: string, password: string): Promise<void>;
}