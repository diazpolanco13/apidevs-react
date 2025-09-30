import { useState } from 'react';

interface LegacyData {
  full_name: string;
  customer_type: 'free' | 'paid' | 'vip';
  customer_since: string;
  tier: 'diamond' | 'gold' | 'silver' | 'bronze' | 'starter' | 'free';
  discount_percentage: number;
  purchase_count: number;
  has_lifetime: boolean;
}

interface LegacyCheckResult {
  isLegacy: boolean;
  legacyData?: LegacyData;
  message?: string;
}

export const useLegacyUserCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<LegacyCheckResult | null>(null);

  const checkLegacyUser = async (email: string): Promise<LegacyCheckResult> => {
    setIsChecking(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/check-legacy-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setResult(data);
      return data;
    } catch (error) {
      console.error('Error checking legacy user:', error);
      const errorResult = { isLegacy: false, message: 'Error checking legacy status' };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsChecking(false);
    }
  };

  const resetCheck = () => {
    setResult(null);
    setIsChecking(false);
  };

  return {
    isChecking,
    result,
    checkLegacyUser,
    resetCheck,
  };
};

