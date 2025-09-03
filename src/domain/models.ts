export type User = { id: string; username: string; email: string };

export type Todo = {
    id: string;
    userID: string;
    title: string;
    body: string;
    dueDate: string | null; 
    completed: boolean;
    completedAt: string | null;
    createdAt?: string;
    updatedAt?: string;
};

