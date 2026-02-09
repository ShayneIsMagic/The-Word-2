'use client';

import { useRouter } from 'next/navigation';
import AmplifiedStudy from '@/components/AmplifiedStudy';

export default function AmplifiedPage() {
  const router = useRouter();

  return (
    <AmplifiedStudy onBack={() => router.push('/')} />
  );
}



