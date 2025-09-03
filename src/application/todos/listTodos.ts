import type { TodoRepository, TodoListFilter } from "@/domain/ports/TodoRepository";

export function listTodosUseCase(repo: TodoRepository) {
    return async (filter?: TodoListFilter) => repo.list(filter)
}