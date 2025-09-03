import type { AuthRepository } from "@/domain/ports/AuthRepository";

export function registerUseCase(authRepo: AuthRepository) {
    return (email: string, username: string, password: string) => {
        authRepo.register(email, username, password);
    }
}