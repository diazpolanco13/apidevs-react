'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface StatusOption {
  value: 'online' | 'busy' | 'away' | 'offline';
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { 
    value: 'online', 
    label: 'En línea', 
    color: 'text-green-400', 
    bgColor: 'bg-green-500',
    icon: '🟢'
  },
  { 
    value: 'busy', 
    label: 'Ocupado', 
    color: 'text-red-400', 
    bgColor: 'bg-red-500',
    icon: '🔴'
  },
  { 
    value: 'away', 
    label: 'Ausente', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-500',
    icon: '🟡'
  },
  { 
    value: 'offline', 
    label: 'Desconectado', 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-500',
    icon: '⚫'
  }
];

interface StatusSelectorProps {
  currentStatus: string;
  userId: string;
  onStatusChange?: (newStatus: string) => void;
}

export default function StatusSelector({ currentStatus, userId, onStatusChange }: StatusSelectorProps) {
  const [updating, setUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setLocalStatus(newStatus);
    
    try {
      const supabase = createClient();
      const { error } = await (supabase as any)
        .from('users')
        .update({ user_status: newStatus })
        .eq('id', userId);

      if (error) {
        console.error('Error updating status:', error);
        setLocalStatus(currentStatus); // Revertir en caso de error
      } else {
        onStatusChange?.(newStatus);
      }
    } catch (err) {
      console.error('Error:', err);
      setLocalStatus(currentStatus);
    } finally {
      setUpdating(false);
    }
  };

  const currentOption = STATUS_OPTIONS.find(opt => opt.value === localStatus) || STATUS_OPTIONS[0];

  return (
    <div className="px-4 py-3 border-t border-apidevs-primary/20">
      <div className="text-xs text-gray-400 mb-2 font-medium">Tu estado</div>
      <div className="space-y-1">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={updating}
            className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all ${
              localStatus === option.value
                ? 'bg-apidevs-primary/20 text-apidevs-primary'
                : 'text-gray-300 hover:bg-apidevs-primary/10'
            } ${updating ? 'opacity-50 cursor-wait' : 'hover:text-apidevs-primary'}`}
          >
            <span className={`w-2 h-2 rounded-full mr-3 ${option.bgColor} ${
              localStatus === option.value ? 'ring-2 ring-apidevs-primary ring-offset-2 ring-offset-apidevs-dark' : ''
            }`} />
            <span className="flex-1 text-left">{option.label}</span>
            {localStatus === option.value && (
              <svg className="w-4 h-4 text-apidevs-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
      {updating && (
        <div className="mt-2 text-xs text-gray-400 flex items-center">
          <svg className="animate-spin h-3 w-3 mr-2 text-apidevs-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Actualizando...
        </div>
      )}
    </div>
  );
}

// Helper function para obtener la configuración del badge según el estado
export function getStatusBadgeConfig(status: string): { color: string; animate: boolean } {
  switch (status) {
    case 'online':
      return { color: 'bg-green-500', animate: true };
    case 'busy':
      return { color: 'bg-red-500', animate: false };
    case 'away':
      return { color: 'bg-yellow-500', animate: false };
    case 'offline':
      return { color: 'bg-gray-500', animate: false };
    default:
      return { color: 'bg-green-500', animate: true };
  }
}
