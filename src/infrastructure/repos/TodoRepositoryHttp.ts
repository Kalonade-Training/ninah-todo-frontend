import { http } from "../http/axiosClient";
import type { Todo } from "@/domain/models";
import type { TodoRepository, TodoListFilter } from "@/domain/ports/TodoRepository";

function mapTodo(raw: any): Todo {
  return {
    id: raw.id,
    userID: raw.user_id,
    title: raw.title,
    body: raw.body ?? raw.description ?? "",
    dueDate: raw.due_date ?? null,
    completed: Boolean(raw.completed),
    completedAt: raw.completed_at ?? null,
    createdAt: raw.created_at ?? undefined,
    updatedAt: raw.updated_at ?? undefined,
  };
}

export class TodoRepositoryHttp implements TodoRepository {
  async list(filter?: TodoListFilter): Promise<Todo[]> {
    const p = new URLSearchParams();
    if (filter?.title) p.set("title", filter.title);
    if (filter?.body) p.set("body", filter.body);
    if (filter?.due_from) p.set("due_from", filter.due_from);
    if (filter?.due_to) p.set("due_to", filter.due_to);
    if (filter?.completed !== undefined) p.set("completed", String(filter.completed));

    const { data } = await http.get("/todos" + (p.toString() ? `?${p}` : ""));
    return (Array.isArray(data) ? data : []).map(mapTodo);
  }

  async detail(id: string): Promise<Todo> {
    const { data } = await http.get(`/todos/${id}`);
    return mapTodo(data);
  }

  async create(input: { title: string; body?: string; due_date?: string }): Promise<Todo> {
    const { data } = await http.post("/todos", input);
    return mapTodo(data);
  }

  async update(
    id: string,
    patch: Partial<{ title: string; body: string; due_date: string; completed: boolean }>
  ): Promise<Todo> {
    const { data } = await http.patch(`/todos/${id}`, patch);
    return mapTodo(data);
  }

  async delete(id: string): Promise<void> {
    await http.delete(`/todos/${id}`);
  }

  async duplicate(id: string): Promise<Todo> {
    const { data } = await http.post(`/todos/${id}/duplicate`);
    return mapTodo(data);
  }
}
