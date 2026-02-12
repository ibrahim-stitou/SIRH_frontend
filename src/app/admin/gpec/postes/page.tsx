"use client";

import PostesListing from '@/features/postes/postes-listing';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';

export default function PostesPage() {
	return (
		<PageContainer scrollable={false}>
			<div className="flex h-full w-full flex-col">
				<div className="flex w-full items-start justify-between">
					<Heading
						title="Postes"
						description="Sélectionnez le poste à configurer"
					/>  
				</div>

				<div className="mt-auto flex w-full flex-1 flex-col space-y-6">
					<PostesListing />
				</div>
			</div>
		</PageContainer>
	);
}