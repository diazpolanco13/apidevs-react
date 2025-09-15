'use client';

import { useState } from 'react';
import EditLocationForm from '@/components/ui/AccountForms/EditLocationForm';

interface LocationData {
  country: string;
  city: string;
  phone: string;
  postal_code: string;
  address: string;
  timezone: string;
}

interface EditLocationClientProps {
  userId: string;
  initialData: LocationData;
}

export default function EditLocationClient({ userId, initialData }: EditLocationClientProps) {
  const [currentData, setCurrentData] = useState(initialData);

  const handleUpdate = (newData: LocationData) => {
    // Update local state immediately for instant UI update
    setCurrentData(newData);
    // No need to refresh the entire page
  };

  return (
    <EditLocationForm 
      userId={userId}
      initialData={currentData}
      onUpdate={handleUpdate}
    />
  );
}
