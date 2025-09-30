import React from 'react';
import 'react-day-picker/dist/style.css';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Badge } from '../../components/ui/badge';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import type { TodoListFilter } from '../../domain/repositories/TodoRepository';

interface TodoFiltersProps {
    filters: TodoListFilter;
    onFiltersChange: (filters: TodoListFilter) => void;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({ filters, onFiltersChange }) => {
    const updateFilter = (key: keyof TodoListFilter, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilter = (key: keyof TodoListFilter) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = Object.keys(filters).some(key => 
        filters[key as keyof TodoListFilter] !== undefined && filters[key as keyof TodoListFilter] !== ''
    );

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                    <Filter size={16} className="text-blue-600" />
                    <h3 className="font-medium text-gray-900">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Title Searchhhhh */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Search in title</label>
                    <div className="relative">
                        <Input
                            placeholder="Search titles.."
                            value={filters.title || ''}
                            onChange={(e) => updateFilter('title', e.target.value || undefined)}
                        />
                        {filters.title && (
                            <button
                                onClick={() => clearFilter('title')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Body searchhh */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Search in description</label>
                    <div className="relative">
                        <Input
                            placeholder="Search description..."
                            value={filters.body || ''}
                            onChange={(e) => updateFilter('body', e.target.value || undefined)}
                        />
                        {filters.body && (
                            <button
                                onClick={() => clearFilter('body')}
                                className="absolute righ-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Completion status */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Status</label>
                    <Select
                        value={filters.completed === undefined ? 'all' : filters.completed ? 'completed' : 'pending'}
                        onValueChange={(value) => {
                            if (value === 'all') {
                                clearFilter('completed');
                            } else {
                                updateFilter('completed', value === 'completed');
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All todos</SelectItem>
                            <SelectItem value="pending">Pending todos</SelectItem>
                            <SelectItem value="completed">Completed todos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Due date frommmm */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Due from</label>
                    <div className="flex gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                    size="sm"
                                >
                                    <CalendarIcon className="mr-2 h-3 w-3" />
                                    {filters.due_from ? format(new Date(filters.due_from), 'MMM dd') : 'Due from'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <DayPicker
                                    mode="single"
                                    selected={filters.due_from ? new Date(filters.due_from) : undefined}
                                    onSelect={(date) => updateFilter('due_from', date ? format(date, 'yyyy-MM-dd') : undefined)}
                                />
                            </PopoverContent>
                        </Popover>
                        {filters.due_from && (
                            <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => clearFilter('due_from')}
                                className="px-2"
                            >
                                <X size={14} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Active filterssssss */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {filters.title && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Title: "{filters.title}"
                            <button onClick={() => clearFilter('title')}>
                                <X size={12} />
                            </button>
                        </Badge>
                    )}
                    {filters.body && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Description: "{filters.body}"
                            <button onClick={() => clearFilter('body')}>
                                <X size={12} />
                            </button>
                        </Badge>
                    )}
                    {filters.completed !== undefined && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Status: {filters.completed ? 'Completed' : 'Pending'}
                            <button onClick={() => clearFilter('completed')}>
                                <X size={12} />
                            </button>
                        </Badge>
                    )}
                    {filters.due_from && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Due from: {format(new Date(filters.due_from), 'MMM dd')}
                            <button onClick={() => clearFilter('due_from')}>
                                <X size={12} />
                            </button>
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};