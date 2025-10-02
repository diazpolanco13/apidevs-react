'use client';

import PurchasesTable from '../overview/PurchasesTable';
import { Purchase } from '@/types/purchases';

interface AllPurchasesTabProps {
  purchases: Purchase[];
}

export default function AllPurchasesTab({ purchases }: AllPurchasesTabProps) {
  return <PurchasesTable purchases={purchases} />;
}

