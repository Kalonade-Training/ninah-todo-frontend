import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUseCase } from '../../application/usecases/AuthUseCase';
import { UserApiRepository } from '../../infrastructure/api/UserApiRepository';
import type { RegisterRequest, LoginRequest } from '../../domain/entities/User';

const userRepository = new UserApiRepository();
const authUseCase = new AuthUseCase(userRepository);

export const useAuth = () => {
    const queryClient = useQueryClient();

    const { data: currentUser, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authUseCase.getCurrentUser(),
        retry: false,
    });

    const registerMutation = useMutation({
        mutationFn: (request: RegisterRequest) => authUseCase.register(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });

    const loginMutation = useMutation({
        mutationFn: (request: LoginRequest) => authUseCase.login(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
    });

    const logout = () => {
        authUseCase.logout();
        queryClient.clear();
        window.location.href = '/login';
    };

    return {
        currentUser, 
        isLoading, 
        isAuthenticated: authUseCase.isAuthenticated(), 
        register: registerMutation.mutateAsync, 
        login: loginMutation.mutateAsync, 
        logout, 
        isRegistering: registerMutation.isPending, 
        isLoggingIn: loginMutation.isPending, 
        registerError: registerMutation.error, 
        loginError: loginMutation.error,
    };
};