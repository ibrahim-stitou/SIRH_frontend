'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import CustomTable from '@/components/custom/data-table/custom-table';
import type {
  CustomTableColumn,
  CustomTableFilterConfig,
  UseTableReturn
} from '@/components/custom/data-table/types';

import { apiRoutes } from '@/config/apiRoutes';
import apiClient from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

import { Eye } from 'lucide-react';

import { getCompetencesByPoste } from '@/services/competenceService';
import ServerError from '@/components/common/server-error';

interface LinkedItem {
  id?: number | string;
  libelle?: string;
  code?: string;
}

interface PosteRow {
  id: number | string;
  code?: string;
  libelle?: string;
  metier?: string | LinkedItem;
  metier_id?: number | string;
  emploi?: string | LinkedItem;
  emploi_id?: number | string;
}

export default function PostesListing() {
  const router = useRouter();

  const [tableInstance, setTableInstance] =
    useState<Partial<UseTableReturn<PosteRow>> | null>(null);

  const [counts, setCounts] = useState<Record<number, number>>({});
  const [metierOptions, setMetierOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [emploiOptions, setEmploiOptions] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [metierById, setMetierById] = useState<Record<string, any>>({});
  const [emploiById, setEmploiById] = useState<Record<string, any>>({});

  const [serverError, setServerError] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);

  /* =========================
     Vérifier serveur
  ========================= */
  const checkServer = async () => {
    try {
      setCheckingServer(true);
      setServerError(false);

      // ping simple (endpoint existant)
      await apiClient.get(apiRoutes.admin.parametres.postes.list);
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED') {
        setServerError(true);
      }
    } finally {
      setCheckingServer(false);
    }
  };

  useEffect(() => {
    checkServer();
  }, []);

  /* =========================
     Charger le nombre de compétences
  ========================= */
  const loadCounts = useCallback(async (rows: PosteRow[] = []) => {
    const map: Record<number, number> = {};

    for (const r of rows) {
      try {
        const data = await getCompetencesByPoste(Number(r.id));
        map[Number(r.id)] = Array.isArray(data) ? data.length : 0;
      } catch {
        map[Number(r.id)] = 0;
      }
    }

    setCounts(map);
  }, []);

  const onInit = useCallback((table: any) => {
    setTableInstance(table);
  }, []);

  useEffect(() => {
    if (tableInstance?.data?.length) {
      loadCounts(tableInstance.data as PosteRow[]);
    }
  }, [tableInstance?.data, loadCounts]);

  /* =========================
     Charger métiers & emplois
  ========================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [mRes, eRes] = await Promise.all([
          apiClient.get(apiRoutes.admin.parametres.metiers.list),
          apiClient.get(apiRoutes.admin.parametres.emplois.list)
        ]);

        if (!mounted) return;

        const metiers = mRes.data?.data || mRes.data || [];
        const emplois = eRes.data?.data || eRes.data || [];

        setMetierOptions(
          metiers.map((m: any) => ({
            label: m.libelle || m.code || String(m.id),
            value: m.id
          }))
        );

        setEmploiOptions(
          emplois.map((e: any) => ({
            label: e.libelle || e.code || String(e.id),
            value: e.id
          }))
        );

        const mMap: Record<string, any> = {};
        metiers.forEach((m: any) => (mMap[String(m.id)] = m));
        setMetierById(mMap);

        const eMap: Record<string, any> = {};
        emplois.forEach((e: any) => (eMap[String(e.id)] = e));
        setEmploiById(eMap);
      } catch {
        // silent
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     Colonnes
  ========================= */
  const columns = useMemo<CustomTableColumn<PosteRow>[]>(() => [
    {
      data: 'libelle',
      label: 'Nom du poste',
      sortable: true
    },
    {
      data: 'metier',
      label: 'Métier',
      sortable: true,
      render: (_v, row) => {
        const m =
          row.metier && typeof row.metier === 'object'
            ? row.metier
            : metierById[String(row.metier_id)];
        return m ? m.libelle || m.code || String(m.id) : '';
      }
    },
    {
      data: 'emploi',
      label: 'Emploi',
      sortable: true,
      render: (_v, row) => {
        const e =
          row.emploi && typeof row.emploi === 'object'
            ? row.emploi
            : emploiById[String(row.emploi_id)];
        return e ? e.libelle || e.code || String(e.id) : '';
      }
    },
   
    {
      data: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_v, row) => (
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="h-8 w-8 p-1.5"
                onClick={() =>
                  router.push(`/admin/gpec/postes/${row.id}`)
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>gérer les compétences</TooltipContent>
          </Tooltip>
        </div>
      )
    }
  ], [counts, metierById, emploiById, router]);

  /* =========================
     Filtres
  ========================= */
  const filters = useMemo<CustomTableFilterConfig[]>(() => [
    {
      field: 'libelle',
      label: 'Nom du poste',
      type: 'text'
    },
    {
      field: 'metier_id',
      label: 'Métier',
      type: 'select',
      options: metierOptions
    },
    {
      field: 'emploi_id',
      label: 'Emploi',
      type: 'select',
      options: emploiOptions
    }
  ], [metierOptions, emploiOptions]);

  /* =========================
     SERVER ERROR UI
  ========================= */
  if (checkingServer) return null;


if (serverError) {
  return (
    <ServerError
      title="Serveur indisponible"
      message="Impossible de charger la liste des postes."
      onRetry={checkServer}
    />
  );
}
  return (

    
    <CustomTable
      url={apiRoutes.admin.parametres.postes.list}
      columns={columns}
      filters={filters}
      onInit={onInit}
    />
  );
}
