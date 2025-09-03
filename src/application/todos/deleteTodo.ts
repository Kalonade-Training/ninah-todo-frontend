import type { TodoRepository } from "@/domain/ports/TodoRepository";

export function deleteTodoUseCase(repo: TodoRepository) {
  return async (id: string) => {
    await repo.delete(id);
  };
}
