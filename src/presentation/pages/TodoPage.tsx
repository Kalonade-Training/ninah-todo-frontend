import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { Plus, LogOut, User, Search } from 'lucide-react';
import { TodoCard } from '../components/TodoCard';
import { TodoFormDialog } from '../components/TodoFormDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { TodoFilters } from '../components/TodoFilters';
import { useAuth } from '../hooks/useAuth';
import { useTodos } from '../hooks/useTodos';
import type { TodoListFilter } from '../../domain/repositories/TodoRepository';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../domain/entities/Todo';

const COPY_SUFFIX = 'のコピー';
const MAX_TITLE_LEN = 50;

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
    isUpdating,
  } = useTodos();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string>('');

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filters.title && !todo.Title.toLowerCase().includes(filters.title.toLowerCase())) {
        return false;
      }

      if (filters.body && !todo.Body.toLowerCase().includes(filters.body.toLowerCase())) {
        return false;
      }

      if (filters.completed !== undefined && todo.Completed !== filters.completed) {
        return false;
      }

      if (filters.due_from && todo.DueDate) {
        const todoDate = new Date(todo.DueDate);
        const filterDate = new Date(filters.due_from);
        if (todoDate < filterDate) {
          return false;
        }
      }

      if (filters.due_to && todo.DueDate) {
        const todoDate = new Date(todo.DueDate);
        const filterDate = new Date(filters.due_to);
        if (todoDate > filterDate) {
          return false;
        }
      }

      return true;
    });
  }, [todos, filters]);

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

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTodo(null);
  };

  const handleDeleteClick = (id: string) => {
    setTodoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (todoToDelete) {
      await deleteTodo(todoToDelete);
      setTodoToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setTodoToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDuplicate = async (id: string) => {
    setDuplicateError('');

    const todo = todos.find(t => t.ID === id);
    if (todo) {
      const candidateTitle = todo.Title + COPY_SUFFIX;
      const candidateLen = [...candidateTitle].length;
      if (candidateLen > MAX_TITLE_LEN) {
        setDuplicateError(
          `Cannot duplicate: title would be ${candidateLen} characters after adding "${COPY_SUFFIX}" (max ${MAX_TITLE_LEN}). Please shorten the original title first.`
        );
        setTimeout(() => setDuplicateError(''), 5000);
        return;
      }
    }

    try {
      await duplicateTodo(id);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to duplicate todo';
      setDuplicateError(errorMsg);
      setTimeout(() => setDuplicateError(''), 5000);
    }
  };

  const completedTodos = filteredTodos.filter(todo => todo.Completed);
  const pendingTodos = filteredTodos.filter(todo => !todo.Completed);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
                <p className="text-sm text-gray-500">Organize your life, one task at a time</p>
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
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error.message || 'An error occurred while loading todos'}
            </AlertDescription>
          </Alert>
        )}

        {duplicateError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{duplicateError}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create New Todo
          </Button>
        </div>

        <div className="mb-6">
          <TodoFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{filteredTodos.length}</div>
            <div className="text-sm text-gray-600">Total Todos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{pendingTodos.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{completedTodos.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        <div className="space-y-6">
          {pendingTodos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Pending Tasks ({pendingTodos.length})
              </h2>
              <div className="grid gap-3">
                {pendingTodos.map((todo) => (
                  <TodoCard
                    key={todo.ID}
                    todo={todo}
                    onToggleComplete={toggleCompletion}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </section>
          )}

          {pendingTodos.length > 0 && completedTodos.length > 0 && (
            <Separator className="my-8" />
          )}

          {completedTodos.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Completed Tasks ({completedTodos.length})
              </h2>
              <div className="grid gap-3">
                {completedTodos.map((todo) => (
                  <TodoCard
                    key={todo.ID}
                    todo={todo}
                    onToggleComplete={toggleCompletion}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredTodos.length === 0 && todos.length === 0 && (
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
                Create Your First Todo
              </Button>
            </div>
          )}

          {filteredTodos.length === 0 && todos.length > 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No todos match your filters</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Button
                variant="outline"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <TodoFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        todo={editingTodo}
        isSubmitting={isCreating || isUpdating}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};