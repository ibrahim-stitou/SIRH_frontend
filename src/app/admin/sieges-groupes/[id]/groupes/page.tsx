import React from 'react';
import PageContainer from '@/components/layout/page-container';
import GroupsListing from '@/features/groups/groups-listing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Building2, Hash, Users } from 'lucide-react';
import apiClient from '@/lib/api';
import { apiRoutes } from '@/config/apiRoutes';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

async function fetchSiege(id: string) {
  try {
    const resp = await apiClient.get(apiRoutes.admin.sieges.show(id));
    return resp?.data?.data || null;
  } catch (e) {
    return null;
  }
}

export default async function GroupsPage({ params }: { params: Promise<{ id: string }> }) {
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
      <div className='flex flex-1 flex-col space-y-4'>
        <Card className='py-3 border-border/80 bg-gradient-to-br from-background to-accent/10 shadow-sm ring-1 ring-border/30'>
          <CardHeader className='px-4 py-2'>
            <div className='flex items-center justify-between gap-2'>
              <div className='min-w-0'>
                <CardTitle className='text-base md:text-lg truncate flex items-center gap-2'>
                  <Building2 className='h-5 w-5 text-primary shrink-0' /> {title}
                </CardTitle>
                <CardDescription className='text-xs'>
                  {city} · {country}
                </CardDescription>
              </div>
              <div className='flex flex-wrap items-center justify-end gap-2'>
                <Badge variant='secondary' className='gap-1 text-xs'>
                  <Hash className='h-3.5 w-3.5' /> {code}
                </Badge>
                {typeof groupsCount === 'number' && (
                  <Badge variant='outline' className='gap-1 text-xs'>
                    <Users className='h-3.5 w-3.5' /> {groupsCount} groupe{groupsCount > 1 ? 's' : ''}
                  </Badge>
                )}
                <Badge variant='outline' className='gap-1 text-xs'>
                  id: {id}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='px-4 pt-0 pb-2'>
            <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
              <div className='text-xs flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='truncate'>{address}</span>
              </div>
              <div className='text-xs flex items-center gap-2'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                {email !== '—' ? (
                  <a href={`mailto:${email}`} className='hover:underline truncate'>
                    {email}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
              <div className='text-xs flex items-center gap-2'>
                <Phone className='h-4 w-4 text-muted-foreground' />
                {phone !== '—' ? (
                  <a href={`tel:${phone}`} className='hover:underline truncate'>
                    {phone}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Separator/>
        <GroupsListing id={id} />
      </div>
    </PageContainer>
  );
}
