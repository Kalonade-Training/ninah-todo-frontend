import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Plus, LogOut, User } from 'lucide-react';
import { TodoCard } from '../components/TodoCard';
import { TodoFormDialog } from '../components/TodoFormDialog';
import { TodoFilters } from '../components/TodoFilters';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';
import type { TodoListFilter } from '../../domain/repositories/TodoRepository';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../domain/entities/Todo';

export const TodoPage: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [filters, setFilters] = useState<TodoListFilter>({});
    const {
        todos, 
        isLoading, 
        error, 
        createTodo, 
        updateTodo, 
        deleteTodo, 
        duplicateTodo, 
        toggleCompletion, 
        isCreating, 
        isUpdating
    } = useTodos(filters);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

    const handleCreateTodo = async (data: CreateTodoRequest) => {
        await createTodo(data);
    };

    const handleUpdateTodo = async (data: UpdateTodoRequest) => {
        if (editingTodo) {
            await updateTodo({ id: editingTodo.ID, request: data });
            setEditingTodo(null);
        }
    };

    const handleEditTodo = (todo: Todo) => {
        setEditingTodo(todo);
        setDialogOpen(true);
    };

    const handleClosingDialog = () => {
        setDialogOpen(false);
        setEditingTodo(null);
    };

    const completedTodos = todos.filter(todo => todo.Completed);
    const pendingTodos = todos.filter(todo => !todo.Completed);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your todos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Headerrrrr */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">T</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
                                <p className="text-sm text-gray-500">Organize your life and be productive</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {currentUser && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User size={16} />
                                    <span>{currentUser.email}</span>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={logout}
                                className="flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>
                            {error.message || 'An error occurred while loading your todos.'}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Creating Todo buttonnnn */}
                <div className="mb-6">
                    <Button 
                        onClick={() => setDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Create new Todo
                    </Button>
                </div>

                {/* Filterssss */}
                <div className="mb-6">
                    <TodoFilters filters={filters} onFiltersChange={setFilters} />
                </div>

                {/* Statssss */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
                        <div className="text-sm text-gray-600">Total Todos</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-orange-600">{pendingTodos.length}</div>
                        <div className="text-sm text-gray-600">Pending Todos</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <div className="text-2xl font-bold text-green-600">{completedTodos.length}</div>
                        <div className="text-sm text-gray-600">Completed Todos</div>
                    </div>
                </div>

                {/* Todoo Listtttt */}
                <div className="space-y-6">
                    {/* Pending Todos */}
                    {pendingTodos.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                            Pending Todos ({pendingTodos.length})
                            </h2>
                            <div className="grid gap-3">
                                {pendingTodos.map((todo) => (
                                    <TodoCard
                                        key={todo.ID}
                                        todo={todo}
                                        onToggleComplete={toggleCompletion}
                                        onEdit={handleEditTodo}
                                        onDelete={deleteTodo}
                                        onDuplicate={duplicateTodo}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Separatorrr */}
                    {pendingTodos.length > 0 && completedTodos.length > 0 && (
                        <Separator className="my-8" />
                    )}

                    {/* Completed Todos */}
                    {completedTodos.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                Completed Todos ({completedTodos.length})
                            </h2>
                            <div className="grid gap-3">
                            {completedTodos.map((todo) => (
                                <TodoCard
                                    key={todo.ID}
                                    todo={todo}
                                    onToggleComplete={toggleCompletion}
                                    onEdit={handleEditTodo}
                                    onDelete={deleteTodo}
                                    onDuplicate={duplicateTodo}
                                />
                            ))}
                            </div>
                            </section>
                        )}

                        {/* Empty stateeee */}
                        {todos.length === 0 && (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus size={32} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No todos yet</h3>
                                <p className="text-gray-600 mb-4">Get started by creating your first todo!</p>
                                <Button
                                    onClick={() => setDialogOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Create Your First Todo!
                                </Button>
                            </div>
                        )}
                    </div>
            </main>

            {/* Form Dialogggg */}
            <TodoFormDialog
                open={dialogOpen}
                onClose={handleClosingDialog}
                onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
                todo={editingTodo || undefined}
                isSubmitting={isCreating || isUpdating}
            />
        </div>
    );
};