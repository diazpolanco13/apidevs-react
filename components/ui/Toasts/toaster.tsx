'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from '@/components/ui/Toasts/toast';
import { useToast } from '@/components/ui/Toasts/use-toast';
import { useEffect, useState } from 'react';

export function Toaster() {
  const { toast, toasts } = useToast();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only running client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Use native browser APIs instead of Next.js hooks to avoid SSR issues
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    
    const status = searchParams.get('status');
    const status_description = searchParams.get('status_description');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');
    
    if (error || status) {
      toast({
        title: error
          ? error ?? 'Hmm... Something went wrong.'
          : status ?? 'Alright!',
        description: error ? error_description : status_description,
        variant: error ? 'destructive' : undefined
      });
      
      // Clear search params to prevent toast showing again
      const newSearchParams = new URLSearchParams(window.location.search);
      const paramsToRemove = [
        'error',
        'status',
        'status_description',
        'error_description'
      ];
      paramsToRemove.forEach((param) => newSearchParams.delete(param));
      const redirectPath = `${pathname}?${newSearchParams.toString()}`;
      window.history.replaceState({}, '', redirectPath);
    }
  }, [mounted, toast]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
