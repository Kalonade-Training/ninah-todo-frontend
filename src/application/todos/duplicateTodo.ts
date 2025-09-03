import type { TodoRepository } from "@/domain/ports/TodoRepository";

export function duplicateTodoUseCase(repo: TodoRepository) {
  return async (id: string) => repo.duplicate(id);
}
