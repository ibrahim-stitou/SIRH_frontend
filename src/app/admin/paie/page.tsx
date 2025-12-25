'use client'
import { useParams } from 'next/navigation';

export default function PaiePage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <div>
      <h1>Paie du {id}</h1>
    </div>
  )
}