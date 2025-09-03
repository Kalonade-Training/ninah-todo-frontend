import type { TodoRepository } from "@/domain/ports/TodoRepository";
import { TitleVO, BodyVO } from "@/domain/value-objects";

export function updateTodoUseCase(repo: TodoRepository) {
  return async (
    id: string,
    patch: Partial<{ title: string; body: string; due_date: string; completed: boolean }>
  ) => {
    if (patch.title !== undefined) TitleVO.parse(patch.title);
    if (patch.body !== undefined) BodyVO.parse(patch.body);
    return repo.update(id, patch);
  };
}
