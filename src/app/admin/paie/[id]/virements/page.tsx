'use client';
import { useParams } from 'next/navigation';

export default function VirementPage (){
  const params = useParams();
  const id = params.id as string;
  return (
    <div>
      <h1>Virement du {id}</h1>
    </div>
  )
}