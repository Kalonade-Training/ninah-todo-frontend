import type { TodoRepository } from "@/domain/ports/TodoRepository";
import { TitleVO, BodyVO } from "@/domain/value-objects";

export function createTodoUseCase(repo: TodoRepository) {
  return async (input: { title: string; body?: string; due_date?: string }) => {
    TitleVO.parse(input.title);
    if (input.body !== undefined) BodyVO.parse(input.body);
    return repo.create(input);
  };
}
