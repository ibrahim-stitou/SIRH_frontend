import React from 'react';
import EmployeeListing from '@/features/employee/employee-listing';
import PageContainer from '@/components/layout/page-container';
export default function EmployeesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <EmployeeListing />
      </div>
    </PageContainer>
  );
}
