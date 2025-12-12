'use client';
import React from 'react';
import Link from 'next/link';

export default function EmployeeCreatePage() {
  return (
    <div className='space-y-6 p-6'>
      <h1 className='text-2xl font-semibold'>Création collaborateur</h1>
      <p className='text-muted-foreground text-sm'>
        Ce module a été remplacé par le nouvel assistant de création employé.
      </p>
      <Link
        href='/admin/personnel/employes/create'
        className='text-primary underline'
      >
        Aller vers la création employé
      </Link>
    </div>
  );
}
