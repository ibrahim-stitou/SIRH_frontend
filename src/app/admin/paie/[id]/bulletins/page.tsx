'use client';
import { useParams } from 'next/navigation';

export default function BulletinsPage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <div>
      <h1>Bulletins du {id}</h1>
    </div>
  )
}