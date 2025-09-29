import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../entities/Todo';

export interface TodoListFilter{
    title?: string;
    body?: string;
    due_from?: string;
    due_to?: string;
    completed?: boolean;
}

export interface TodoRepository {
    getTodos(filter?: TodoListFilter): Promise<Todo[]>;
    getTodoById(id: string): Promise<Todo>;
    createTodo(data: CreateTodoRequest): Promise<Todo>;
    updateTodo(id: string, todo: UpdateTodoRequest): Promise<Todo>;
    deleteTodo(id: string): Promise<void>;
    duplicateTodo(id: string): Promise<Todo>;
}