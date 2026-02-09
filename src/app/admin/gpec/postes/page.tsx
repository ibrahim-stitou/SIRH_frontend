"use client";

import PostesListing from '@/features/postes/postes-listing';
import PageContainer from '@/components/layout/page-container';

export default function PostesPage() {
	return (
		<PageContainer scrollable={false}>
			<div className="flex items-center justify-between">
				{/* <div>
					<h1 className="text-2xl font-semibold">Postes</h1>
					<p className="text-muted-foreground text-sm">Sélectionnez le poste à configurer</p>
				</div> */}
      	 {/* <Heading
								title="Postes"
								description="Sélectionnez le poste à configurer"
							/> */}
			
			</div>

			<div className="flex flex-1 flex-col space-y-6">
				<PostesListing />
			</div>
		</PageContainer>
	);
}

