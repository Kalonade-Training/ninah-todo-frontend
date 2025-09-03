import { useMemo } from "react";
import { TodoRepositoryHttp } from "@/infrastructure/repos/TodoRepositoryHttp";
import {
  listTodosUseCase,
  getTodoUseCase,
  createTodoUseCase,
  updateTodoUseCase,
  deleteTodoUseCase,
  duplicateTodoUseCase,
} from "@/application/todos";

export function useTodoServices() {
  const repo = useMemo(() => new TodoRepositoryHttp(), []);

  return useMemo(() => ({
    listTodos: listTodosUseCase(repo),
    getTodo: getTodoUseCase(repo),
    createTodo: createTodoUseCase(repo),
    updateTodo: updateTodoUseCase(repo),
    deleteTodo: deleteTodoUseCase(repo),
    duplicateTodo: duplicateTodoUseCase(repo),
  }), [repo]);
}
