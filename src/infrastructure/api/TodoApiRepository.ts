import type { TodoRepository, TodoListFilter } from '../../domain/repositories/TodoRepository';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../domain/entities/Todo';
import { apiClient } from './ApiClient';

export class TodoApiRepository implements TodoRepository {
    async getTodos(filter?: TodoListFilter): Promise<Todo[]> {
        const params = new URLSearchParams();

        if (filter) {
            if (filter.title) params.append('title', filter.title);
            if (filter.body) params.append('body', filter.body);
            if (filter.due_from) params.append('due_from', filter.due_from);
            if (filter.due_to) params.append('due_to', filter.due_to);
            if (filter.completed !== undefined) params.append('completed', filter.completed.toString());
        }

        return apiClient.get<Todo[]>(`/todos${params.toString() ? `?${params.toString()}` : ''}`);
    }

    async getTodoById(id: string): Promise<Todo> {
        return apiClient.get<Todo>(`/todos/${id}`);
    }
    async createTodo(todo: CreateTodoRequest): Promise<Todo> {
        return apiClient.post<Todo>('/todos', todo);
    }
    async updateTodo(id: string, todo: UpdateTodoRequest): Promise<Todo> {
        return apiClient.patch<Todo>(`/todos/${id}`, todo);
    }
    async deleteTodo(id: string): Promise<void> {
        return apiClient.delete<void>(`/todos/${id}`);
    }
    async duplicateTodo(id: string): Promise<Todo> {
        return apiClient.post<Todo>(`/todos/${id}/duplicate`);
    }
}