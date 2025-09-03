import type { Todo } from "../models";

export type TodoListFilter = {
    title?: string; body?: string;
    due_from?: string; due_to?: string;
    completed?: boolean;
};

export interface TodoRepository {
    list(filter?: TodoListFilter): Promise<Todo[]>;
    detail(id: string): Promise<Todo>;
    create(input: { title: string; body?: string; due_date?: string }): Promise<Todo>;
    update(id: string, patch: Partial<{ title: string; body?: string; due_date: string; completed: boolean }>): Promise<Todo>;
    delete(id: string): Promise<void>;
    duplicate(id: string): Promise<Todo>;
}