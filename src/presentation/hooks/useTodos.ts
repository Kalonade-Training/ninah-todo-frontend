import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TodoUseCase } from '../../application/usecases/TodoUseCase';
import { TodoApiRepository } from '../../infrastructure/api/TodoApiRepository';
import type { CreateTodoRequest, UpdateTodoRequest } from '../../domain/entities/Todo';

const todoRepository = new TodoApiRepository();
const todoUseCase = new TodoUseCase(todoRepository);

export const useTodos = () => {
    const queryClient = useQueryClient();

    const { data: todos = [], isLoading, error } = useQuery({
        queryKey: ['todos'],
        queryFn: () => todoUseCase.getTodos(),
    });

    const createTodoMutation = useMutation({
        mutationFn: (request: CreateTodoRequest) => todoUseCase.createTodo(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const updateTodoMutation = useMutation({
        mutationFn: ({ id, request }: { id: string; request: UpdateTodoRequest }) =>
            todoUseCase.updateTodo(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const deleteTodoMutation = useMutation({
        mutationFn: (id: string) => todoUseCase.deleteTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const duplicateTodoMutation = useMutation({
        mutationFn: (id: string) => todoUseCase.duplicateTodo(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    const toggleCompletionMutation = useMutation({
        mutationFn: (id: string) => todoUseCase.toggleTodoCompletion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['todos'] });
        },
    });

    return {
        todos,
        isLoading,
        error,
        createTodo: createTodoMutation.mutateAsync,
        updateTodo: updateTodoMutation.mutateAsync,
        deleteTodo: deleteTodoMutation.mutateAsync,
        duplicateTodo: duplicateTodoMutation.mutateAsync,
        toggleCompletion: toggleCompletionMutation.mutateAsync,
        isCreating: createTodoMutation.isPending,
        isUpdating: updateTodoMutation.isPending,
        isDeleting: deleteTodoMutation.isPending,
        isDuplicating: duplicateTodoMutation.isPending,
        isToggling: toggleCompletionMutation.isPending,
    };
};