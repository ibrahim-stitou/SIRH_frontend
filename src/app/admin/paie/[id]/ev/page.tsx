'use client';
import { useParams } from 'next/navigation';

export default function EvPage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <div>
      <h1>Ev du {id}</h1>
    </div>
  )
}