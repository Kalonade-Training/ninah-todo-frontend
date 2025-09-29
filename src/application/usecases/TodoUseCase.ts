import type { TodoRepository, TodoListFilter } from '../../domain/repositories/TodoRepository';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../domain/entities/Todo';

export class TodoUseCase {
    private todoRepository: TodoRepository;

    constructor(todoRepository: TodoRepository) {
        this.todoRepository = todoRepository;
    }

    async getTodos(filter?: TodoListFilter): Promise<Todo[]> {
        return this.todoRepository.getTodos(filter);
    }

    async getTodoById(id: string): Promise<Todo> {
        if (!id.trim()) {
            throw new Error('Todo ID is required');
        }
        return this.todoRepository.getTodoById(id);
    }
    async createTodo(request: CreateTodoRequest): Promise<Todo> {
        if (!request.title.trim()) {
            throw new Error('Title is required');
        }
        if (request.title.length > 50) {
            throw new Error("Title is too long.");
        }
        if (request.body.length > 1000) {
            throw new Error("Body is too long. ");
        }

        return this.todoRepository.createTodo(request);
    }

    async updateTodo(id: string, request: UpdateTodoRequest): Promise<Todo> {
        if(!id.trim()) {
            throw new Error('Todo ID is required');
        }
        if (request.title && !request.title.trim()) {
            throw new Error('Title can not be empty');
        }
        if (request.title && request.title.length > 50) {
            throw new Error('Title is too long');
        }
        if (request.body && request.body.length > 1000) {
            throw new Error('Body is too long');
        }

        return this.todoRepository.updateTodo(id, request);
    }

    async deleteTodo(id: string): Promise<void> {
        if (!id.trim()) {
            throw new Error('Todo ID is required');
        }
        return this.todoRepository.deleteTodo(id);
    }

    async duplicateTodo(id: string): Promise<Todo> {
        if (!id.trim()) {
            throw new Error('Todo ID is required');
        }
        return this.todoRepository.duplicateTodo(id);
    }

    async toggleTodoCompletion(id: string): Promise<Todo> {
        const todo = await this.getTodoById(id);
        return this.updateTodo(id, { completed: !todo.Completed });
    }
}