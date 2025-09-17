'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import UserFilters, { UserFilterState, UserSortState } from './UserFilters';

interface UsersFilterWrapperProps {
  totalItems: number;
  filteredItems: number;
}

export default function UsersFilterWrapper({ totalItems, filteredItems }: UsersFilterWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (filters: UserFilterState) => {
    const url = new URL(window.location.href);
    
    // Limpiar página al cambiar filtros
    url.searchParams.delete('page');
    
    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });

    router.push(url.toString());
  };

  const handleSortChange = (sort: UserSortState) => {
    const url = new URL(window.location.href);
    
    // Limpiar página al cambiar ordenamiento
    url.searchParams.delete('page');
    
    // Aplicar ordenamiento
    url.searchParams.set('sortField', sort.field);
    url.searchParams.set('sortDirection', sort.direction);

    router.push(url.toString());
  };

  return (
    <UserFilters
      onFilterChange={handleFilterChange}
      onSortChange={handleSortChange}
      totalItems={totalItems}
      filteredItems={filteredItems}
    />
  );
}
