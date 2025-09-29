import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Calendar } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CalendarIcon, X } from 'lucide-react';
import type { Todo } from '../../domain/entities/Todo';

interface TodoFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  todo?: Todo | null;
  isSubmitting?: boolean;
}

export const TodoFormDialog: React.FC<TodoFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  todo,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    due_date: null as Date | null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.Title,
        body: todo.Body,
        due_date: todo.DueDate ? new Date(todo.DueDate) : null,
      });
    } else {
      setFormData({
        title: '',
        body: '',
        due_date: null,
      });
    }
    setError(null);
  }, [todo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        title: formData.title,
        body: formData.body,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : undefined,
      };

      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-blue-900">
            {todo ? 'Edit Todo' : 'Create New Todo'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter todo title"
              maxLength={50}
              required
            />
            <div className="text-xs text-gray-500">
              {formData.title.length}/50 characters
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="body" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder="Enter todo description"
              maxLength={1000}
              rows={3}
            />
            <div className="text-xs text-gray-500">
              {formData.body.length}/1000 characters
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Due Date
            </label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ?? undefined}
                    onSelect={(date) => handleChange('due_date', date)}
                  />
                </PopoverContent>
              </Popover>
              
              {formData.due_date && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleChange('due_date', null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : todo ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};