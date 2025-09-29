import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Badge } from '../../components/ui/badge';
import { Calendar, Copy, Edit, Trash2 } from 'lucide-react';
import type { Todo } from '../../domain/entities/Todo';

interface TodoCardProps {
    todo: Todo;
    onToggleComplete: (id: string) => void;
    onEdit: (todo: Todo) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    isToggling?: boolean;
    isDeleting?: boolean;
    isDuplicating?: boolean;
}

export const TodoCard: React.FC<TodoCardProps> = ({
    todo, 
    onToggleComplete,
    onEdit,
    onDelete,
    onDuplicate,
    isToggling = false, 
    isDeleting = false,
    isDuplicating = false,
}) => {
    const isOverdue = todo.DueDate && new Date(todo.DueDate) < new Date() && !todo.Completed;

    return (
        <Card className={`transition-all duration-200 hover:shadow-md ${
            todo.Completed? 'bg-green-50 border-green-200'
            : isOverdue
            ?  'bg-red-50 border-red-200'
            : 'bg-white border-gray-200'
        }`}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Checkbox
                        checked={todo.Completed}
                        onCheckedChange={() => onToggleComplete(todo.ID)}
                        disabled={isToggling}
                        className="mt-1"
                    />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-medium truncate ${
                                todo.Completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                                {todo.Title}
                            </h3>

                            {todo.DueDate && (
                                <Badge
                                    variant={isOverdue ? 'destructive' : todo.Completed ? 'secondary' : 'outline'}
                                    className="flex items-center gap-1 text-xs"
                                    >
                                    <Calendar size={12} />
                                    {format(new Date(todo.DueDate), 'MMM dd')}
                                </Badge>
                            )}

                            {todo.Completed && todo.CompletedAt && (
                                <Badge variant="secondary" className="text-xs">
                                    Completed {format(new Date(todo.CompletedAt), 'MMM dd')}
                                </Badge>
                            )}
                        </div>

                        {todo.Body && (
                            <p className={`text-sm mb-3 ${
                                todo.Completed ? 'text-gray-400' : 'text-gray-600'
                            }`}>{todo.Body}</p>
                        )}

                        <div className="flex items-center gap-1">
                            <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(todo)}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Edit size={14} />
                            </Button>

                            <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDuplicate(todo.ID)}
                            disabled={isDuplicating}
                            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                                <Copy size={14} />
                            </Button>

                            <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(todo.ID)}
                            disabled={isDeleting}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};