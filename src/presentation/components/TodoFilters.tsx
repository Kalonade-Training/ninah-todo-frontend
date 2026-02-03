import React, { useEffect, useState } from 'react';
import 'react-day-picker/dist/style.css';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DayPicker } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Badge } from '../../components/ui/badge';
import { CalendarIcon, X, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { TodoListFilter } from '../../domain/repositories/TodoRepository';

interface TodoFiltersProps {
  filters: TodoListFilter;
  onFiltersChange: (filters: TodoListFilter) => void;
}

export const TodoFilters: React.FC<TodoFiltersProps> = ({ filters, onFiltersChange }) => {
  const [titleInput, setTitleInput] = useState(filters.title || '');
  const [bodyInput, setBodyInput] = useState(filters.body || '');

  useEffect(() => {
    setTitleInput(filters.title || '');
    setBodyInput(filters.body || '');
  }, [filters.title, filters.body]);

  const updateFilter = (key: keyof TodoListFilter, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof TodoListFilter) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setTitleInput('');
    setBodyInput('');
  };

  const applySearch = () => {
    const newFilters = { ...filters };

    if (titleInput.trim()) {
      newFilters.title = titleInput.trim();
    } else {
      delete newFilters.title;
    }

    if (bodyInput.trim()) {
      newFilters.body = bodyInput.trim();
    } else {
      delete newFilters.body;
    }
    
    onFiltersChange(newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applySearch();
    }
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof TodoListFilter] !== undefined && filters[key as keyof TodoListFilter] !== ''
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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

      {/* Search Section */}
      <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 font-medium">
          Type your search terms and press Enter or click the Search button
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Search in title</label>
            <Input
              placeholder="Type title..."
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Search in description</label>
            <Input
              placeholder="Type description..."
              value={bodyInput}
              onChange={(e) => setBodyInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-white"
            />
          </div>
        </div>

        <Button
          onClick={applySearch}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Search size={16} className="mr-2" />
          Search Todos
        </Button>
      </div>

      {/* Other Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Status */}
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date From */}
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
                  {filters.due_from ? format(new Date(filters.due_from), 'MMM dd') : 'From date'}
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

        {/* Due Date To */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Due to</label>
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  size="sm"
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {filters.due_to ? format(new Date(filters.due_to), 'MMM dd') : 'To date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <DayPicker
                  mode="single"
                  selected={filters.due_to ? new Date(filters.due_to) : undefined}
                  onSelect={(date) => updateFilter('due_to', date ? format(date, 'yyyy-MM-dd') : undefined)}
                />
              </PopoverContent>
            </Popover>
            {filters.due_to && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearFilter('due_to')}
                className="px-2"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.title && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Title: "{filters.title}"
              <button onClick={() => {
                clearFilter('title');
                setTitleInput('');
              }}>
                <X size={12} />
              </button>
            </Badge>
          )}
          {filters.body && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Description: "{filters.body}"
              <button onClick={() => {
                clearFilter('body');
                setBodyInput('');
              }}>
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
          {filters.due_to && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Due to: {format(new Date(filters.due_to), 'MMM dd')}
              <button onClick={() => clearFilter('due_to')}>
                <X size={12} />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};