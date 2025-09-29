export interface Todo {
    ID: string;
    UserID: string;
    Title: string;
    Body: string;
    DueDate: string | null;
    Completed: boolean;
    CompletedAt: string | null;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface CreateTodoRequest {
    title: string;
    body: string;
    due_date?: string;
}

export interface UpdateTodoRequest {
    title?: string;
    body?: string;
    due_date?: string | null;
    completed?: boolean;
}