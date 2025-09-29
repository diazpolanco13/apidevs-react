'use client';

import { useState } from 'react';
import EditProfileForm from '@/components/ui/AccountForms/EditProfileForm';

interface ProfileData {
  full_name: string;
  tradingview_username: string;
  avatar_url?: string;
}

interface EditProfileClientProps {
  userId: string;
  initialData: ProfileData;
}

export default function EditProfileClient({ userId, initialData }: EditProfileClientProps) {
  const [currentData, setCurrentData] = useState(initialData);

  const handleUpdate = (newData: ProfileData) => {
    // Update local state immediately for instant UI update
    setCurrentData(newData);
    // Refresh page to show new avatar
    window.location.reload();
  };

  return (
    <EditProfileForm 
      userId={userId}
      initialData={currentData}
      onUpdate={handleUpdate}
    />
  );
}
