import React from 'react';
import PageContainer from '@/components/layout/page-container';
import GroupsListing from '@/features/groups/groups-listing';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Mail,
  Phone,
  Building2,
  Hash,
  Users,
  Clock
} from 'lucide-react';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

async function fetchSiege(id: string) {
  try {
    const resp = await apiClient.get(apiRoutes.admin.sieges.show(id));
    return resp?.data?.data || null;
  } catch (e) {
    return null;
  }
}

export default async function GroupsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siege = await fetchSiege(id);

  if (!siege) {
    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-6'>
          <Alert>
            <AlertTitle>Siège introuvable</AlertTitle>
            <AlertDescription>
              Impossible d&apos;afficher les informations du siège.{' '}
              <Link href='/admin/sieges-groupes' className='underline'>
                Retour à la liste
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  const title = siege?.name as string;
  const code = siege?.code as string;
  const city = (siege?.city as string) || '—';
  const country = (siege?.country as string) || '—';
  const address = (siege?.address as string) || '—';
  const email = (siege?.email as string) || '—';
  const phone = (siege?.phone as string) || '—';
  const groupsCount = Array.isArray(siege?.groups)
    ? siege.groups.length
    : typeof siege?.groupsCount === 'number'
      ? siege.groupsCount
      : undefined;

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-6'>
        <Card className='border-border/80 from-background to-accent/10 ring-border/40 bg-gradient-to-br shadow-sm ring-1'>
          <CardHeader className='border-b/60 flex flex-col gap-3'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-2'>
                <Building2 className='text-primary h-6 w-6 shrink-0' />
                <CardTitle className='truncate text-2xl'>{title}</CardTitle>
              </div>
              <div className='flex flex-wrap items-center justify-end gap-2'>
                <Badge variant='secondary' className='gap-1'>
                  <Hash className='h-3.5 w-3.5' /> {code}
                </Badge>
                {typeof groupsCount === 'number' && (
                  <Badge variant='outline' className='gap-1'>
                    <Users className='h-3.5 w-3.5' /> {groupsCount} groupe
                    {groupsCount > 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant='outline' className='gap-1'>
                  id: {id}
                </Badge>
              </div>
            </div>
            <CardDescription className='flex items-center gap-2'>
              <span className='truncate'>{city}</span>
              <span>·</span>
              <span className='truncate'>{country}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='flex items-start gap-2 text-sm'>
                <MapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                <div>
                  <div className='text-muted-foreground'>Adresse</div>
                  <div className='font-medium'>{address}</div>
                </div>
              </div>
              <div className='flex items-start gap-2 text-sm'>
                <Mail className='text-muted-foreground mt-0.5 h-4 w-4' />
                <div>
                  <div className='text-muted-foreground'>Email</div>
                  <div className='font-medium'>
                    {email !== '—' ? (
                      <a href={`mailto:${email}`} className='hover:underline'>
                        {email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
              <div className='flex items-start gap-2 text-sm'>
                <Phone className='text-muted-foreground mt-0.5 h-4 w-4' />
                <div>
                  <div className='text-muted-foreground'>Téléphone</div>
                  <div className='font-medium'>
                    {phone !== '—' ? (
                      <a href={`tel:${phone}`} className='hover:underline'>
                        {phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Separator className='my-4' />
            <div className='text-muted-foreground text-xs'>
              Gérez ci-dessous les groupes liés à ce siège.
            </div>
          </CardContent>
        </Card>

        <GroupsListing id={id} />
      </div>
    </PageContainer>
  );
}
