import React from 'react';
import { useRouter } from 'next/navigation';
import FraisForm from '@/features/paie/frais/frais-form';

export default function Page({ params }: { params: { id: string } }) {
  const idNum = Number(params.id);

  return <FraisForm id={idNum} />;
}
