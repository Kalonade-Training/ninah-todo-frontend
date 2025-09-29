import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useAuth } from '../hooks/useAuth';
import type { LoginRequest } from '../../domain/entities/User';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoggingIn, loginError } = useAuth();
    const [formData, setFormData] = useState<LoginRequest>({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        try {
            await login(formData);
            navigate('/');
        } catch (error) {

        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev, 
            [e.target.name]: e.target.value,
        }));
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center text-blue-900 ">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Please sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {loginError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {loginError.message || "Login failed. Please try again."}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoggingIn}>
                        {isLoggingIn ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-gray-600">Don't have an account?</span>
                    <Link to='/register' className="text-blue-600 hover:underline">
                    Sign Up
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
);
};