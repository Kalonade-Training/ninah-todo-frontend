import type { TodoRepository } from "@/domain/ports/TodoRepository";

export function getTodoUseCase(repo: TodoRepository) {
    return async (id: string) => repo.detail(id);
}