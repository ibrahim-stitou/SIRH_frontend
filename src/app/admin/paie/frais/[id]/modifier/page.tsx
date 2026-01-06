'use client';
import React from 'react';
import FraisForm from '@/features/paie/frais/frais-form';
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const idNum = Number(idParam);

  return <FraisForm id={idNum} />;
}
