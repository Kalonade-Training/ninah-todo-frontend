import type { AuthRepository } from "@/domain/ports/AuthRepository";

export function loginUseCase(authRepo: AuthRepository) {
    return async (email: string, password: string) => {
        const { token } = await authRepo.login(email, password); 
        return token;
    };
}