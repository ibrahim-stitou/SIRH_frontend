const API_BASE =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true'
    ? process.env.JSON_SERVER_URL || 'http://localhost:3001'
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8003/api/v1';

export const apiRoutes = {
  auth: {
    login: `${API_BASE}/login`,
    register: `${API_BASE}/register`,
    logout: `${API_BASE}/logout`,
    // json-server mock supports both /refresh and /refresh-token handlers provided by the mock server
    refreshToken: `${API_BASE}/refresh`,
    me: `${API_BASE}/me`,
    forgotPassword: `${API_BASE}/forgot-password`,
    resetPassword: `${API_BASE}/reset-password`
  },

  files: {
    uploadTemp: `${API_BASE}/files/upload-temp`,
    cleanupTemp: `${API_BASE}/files/cleanup-temp`
  },

  common: {
    profile: {
      get: `${API_BASE}/user`,
      update: `${API_BASE}/profile`,
      changePassword: `${API_BASE}/password`
    },
    debug: `${API_BASE}/debug-user`
  },

  admin: {
    users: {
      list: `${API_BASE}/users`,
      delete: (id: number | string) => `${API_BASE}/users/${id}`,
      details: (id: number | string) => `${API_BASE}/users/${id}`,
      update: (id: number | string) => `${API_BASE}/users/${id}`
    },
    employees: {
      list: `${API_BASE}/hrEmployees`,
      simpleList: `${API_BASE}/hrEmployees/simple-list`,
      managersSimpleList: `${API_BASE}/hrEmployees/managers/simple-list`,
      delete: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      details: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      update: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      history: (id: number | string) => `${API_BASE}/hrEmployees/${id}/history`,
      createHistory: (id: number | string) =>
        `${API_BASE}/hrEmployees/${id}/history`,
      movementTypes: `${API_BASE}/movement-types`
    },
    departments: {
      list: `${API_BASE}/departments`,
      show: (id: number | string) => `${API_BASE}/departments/${id}`,
      simpleList: `${API_BASE}/departments/simple-list`
    },
    media: {
      list: `${API_BASE}/userMedia`,
      details: (id: number | string) => `${API_BASE}/userMedia/${id}`
    },
    attestations: {
      requests: {
        list: `${API_BASE}/attestationRequests`,
        create: `${API_BASE}/attestationRequests`,
        update: (id: number | string) =>
          `${API_BASE}/attestationRequests/${id}`,
        delete: (id: number | string) =>
          `${API_BASE}/attestationRequests/${id}`,
        show: (id: number | string) => `${API_BASE}/attestationRequests/${id}`
      },
      generated: {
        list: `${API_BASE}/attestations`,
        create: `${API_BASE}/attestations`,
        update: (id: number | string) => `${API_BASE}/attestations/${id}`,
        delete: (id: number | string) => `${API_BASE}/attestations/${id}`,
        show: (id: number | string) => `${API_BASE}/attestations/${id}`
      }
    },
    contratsEtMovements: {
      contrats: {
        list: `${API_BASE}/contracts`,
        create: `${API_BASE}/contracts`,
        update: (id: number | string) => `${API_BASE}/contracts/${id}`,
        delete: (id: number | string) => `${API_BASE}/contracts/${id}`,
        show: (id: number | string) => `${API_BASE}/contracts/${id}`,
        generate: (id: number | string) =>
          `${API_BASE}/contracts/${id}/generate`,
        validate: (id: number | string) =>
          `${API_BASE}/contracts/${id}/validate`,
        uploadSigned: (id: number | string) =>
          `${API_BASE}/contracts/${id}/upload-signed`,
        cancel: (id: number | string) => `${API_BASE}/contracts/${id}/cancel`,
        conditionsCatalog: `${API_BASE}/contract-conditions`,
        conditionsByContract: (id: number | string) =>
          `${API_BASE}/contracts/${id}/conditions`,
        updateConditions: (id: number | string) =>
          `${API_BASE}/contracts/${id}/conditions`,
        trialCriteriaCatalog: `${API_BASE}/trial-criteria`,
        trialCriteriaByContract: (id: number | string) =>
          `${API_BASE}/contracts/${id}/trial-criteria`,
        updateTrialCriteria: (id: number | string) =>
          `${API_BASE}/contracts/${id}/trial-criteria`
      },
      avenants: {
        list: `${API_BASE}/avenants`,
        create: `${API_BASE}/avenants`,
        update: (id: number | string) => `${API_BASE}/avenants/${id}`,
        delete: (id: number | string) => `${API_BASE}/avenants/${id}`,
        show: (id: number | string) => `${API_BASE}/avenants/${id}`,
        byContract: (contractId: number | string) =>
          `${API_BASE}/contracts/${contractId}/avenants`
      }
    },
    headquarters: {
      // CRUD on raw headquarters collection
      list: `${API_BASE}/headquarters`,
      create: `${API_BASE}/headquarters`,
      show: (id: number | string) => `${API_BASE}/headquarters/${id}`,
      update: (id: number | string) => `${API_BASE}/headquarters/${id}`,
      delete: (id: number | string) => `${API_BASE}/headquarters/${id}`
    },
    sieges: {
      // Enriched list with groups via custom route
      list: `${API_BASE}/sieges`,
      show: (id: number | string) => `${API_BASE}/sieges/${id}`,
      groupsBySiege: (id: number | string) => `${API_BASE}/sieges/${id}/groups`
    },
    groups: {
      list: `${API_BASE}/groups`,
      create: `${API_BASE}/groups`,
      show: (id: number | string) => `${API_BASE}/groups/${id}`,
      update: (id: number | string) => `${API_BASE}/groups/${id}`,
      delete: (id: number | string) => `${API_BASE}/groups/${id}`,
      members: (id: number | string) => `${API_BASE}/groups/${id}/members`,
      updateMembers: (id: number | string) =>
        `${API_BASE}/groups/${id}/members`,
      groupByEmployee: (employeeId: number | string) =>
        `${API_BASE}/groups/employee/${employeeId}`
    },
    pointages: {
      list: `${API_BASE}/pointages`,
      show: (id: number | string) => `${API_BASE}/pointages/${id}`,
      create: `${API_BASE}/pointages`,
      update: (id: number | string) => `${API_BASE}/pointages/${id}`,
      delete: (id: number | string) => `${API_BASE}/pointages/${id}`,
      validate: (id: number | string) => `${API_BASE}/pointages/${id}/validate`,
      refuse: (id: number | string) => `${API_BASE}/pointages/${id}/refuse`,
      export: {
        csv: `${API_BASE}/pointages/export.csv`,
        xlsx: `${API_BASE}/pointages/export.xlsx`,
        modelCsv: `${API_BASE}/pointages/export/model.csv`,
        modelXlsx: `${API_BASE}/pointages/export/model.xlsx`
      },
      import: `${API_BASE}/pointages/import`
    },
    tableauPresence: {
      list: `${API_BASE}/tableau-presence`,
      show: (id: number | string) => `${API_BASE}/tableau-presence/${id}`,
      employees: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/employees`,
      days: (id: number | string, employeeId?: number | string) =>
        `${API_BASE}/tableau-presence/${id}/days${employeeId ? `?employeeId=${employeeId}` : ''}`,
      createDay: (tableauId: number | string) =>
        `${API_BASE}/tableau-presence/${tableauId}/days`,
      updateDay: (tableauId: number | string, dayId: number | string) =>
        `${API_BASE}/tableau-presence/${tableauId}/days/${dayId}`,
      generate: `${API_BASE}/tableau-presence/generate`,
      import: `${API_BASE}/tableau-presence/import`,
      exportExcel: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/export-excel`,
      exportModel: `${API_BASE}/tableau-presence/export-model`,
      validateManager: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/validate-manager`,
      validateRh: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/validate-rh`,
      close: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/close`,
      exportXlsx: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/export.xlsx`,
      regenerate: (id: number | string) =>
        `${API_BASE}/tableau-presence/${id}/regenerate`,
      delete: (id: number | string) => `${API_BASE}/tableau-presence/${id}`,
      updateEmployee: (
        tableauId: number | string,
        employeeId: number | string
      ) => `${API_BASE}/tableau-presence/${tableauId}/employees/${employeeId}`
    },
    absences: {
      list: `${API_BASE}/absences`,
      create: `${API_BASE}/absences`,
      update: (id: number | string) => `${API_BASE}/absences/${id}`,
      delete: (id: number | string) => `${API_BASE}/absences/${id}`,
      show: (id: number | string) => `${API_BASE}/absences/${id}`,
      cancel: (id: number | string) => `${API_BASE}/absences/${id}/cancel`,
      validate: (id: number | string) => `${API_BASE}/absences/${id}/validate`,
      close: (id: number | string) => `${API_BASE}/absences/${id}/close`,
      types: `${API_BASE}/absence-types`,
      typesSimple: `${API_BASE}/absence-types/simple-list`,
      refuse: (id: string | number) => `/absences/${id}/refuse`
    },
    conges: {
      congeCompteurs: {
        list: `${API_BASE}/conge-compteurs`,
        show: (id: number | string) => `${API_BASE}/conge-compteurs/${id}`,
        compteursByEmployee: (employeeId: number | string) =>
          `${API_BASE}/conge-compteurs/employee/${employeeId}`
      }
    },
    paies: {
      periodes: {
        list: `${API_BASE}/paies`,
        create: `${API_BASE}/paies`,
        show: (id: number | string) => `${API_BASE}/paies/${id}`,
        update: (id: number | string) => `${API_BASE}/paies/${id}`,
        delete: (id: number | string) => `${API_BASE}/paies/${id}`,
        cloture: (id: number | string) => `${API_BASE}/paies/${id}/cloture`,
        generatePDF: (id: number | string) =>
          `${API_BASE}/paies/${id}/generate-pdf`,
        sendEmails: (id: number | string) =>
          `${API_BASE}/paies/${id}/send-emails`,
        export: (id: number | string) => `${API_BASE}/paies/${id}/export`
      },
      bulletins: {
        list: (periodeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins`,
        show: (periodeId: number | string, employeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}`,
        update: (periodeId: number | string, employeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}`,
        updateTempsTravail: (
          periodeId: number | string,
          employeId: number | string
        ) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}/temps-travail`,
        addElement: (periodeId: number | string, employeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}/elements`,
        deleteElement: (
          periodeId: number | string,
          employeId: number | string,
          rubriqueId: number | string
        ) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}/elements/${rubriqueId}`,
        reset: (periodeId: number | string, employeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}/reset`,
        generate: (periodeId: number | string, employeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}/generate`,
        close: (periodeId: number | string, employeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/bulletins/${employeId}/close`
      },
      rubriques: {
        list: `${API_BASE}/paies/rubriques/all`,
        byType: (type: string) => `${API_BASE}/paies/rubriques/type/${type}`
      },
      virements: {
        list: (periodeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/virements`,
        execute: (periodeId: number | string) =>
          `${API_BASE}/paies/${periodeId}/virements/executer`
      }
    },
    avances: {
      list: `${API_BASE}/avances`,
      show: (id: number | string) => `${API_BASE}/avances/${id}`,
      create: `${API_BASE}/avances`,
      update: (id: number | string) => `${API_BASE}/avances/${id}`,
      delete: (id: number | string) => `${API_BASE}/avances/${id}`,
      validate: (id: number | string) => `${API_BASE}/avances/${id}/valider`,
      refuse: (id: number | string) => `${API_BASE}/avances/${id}/refuse`,
      countForEmployeeCurrentYear: (employeeId: number | string) =>
        `${API_BASE}/avances/employee/${employeeId}/count-current-year`
    },
    prets: {
      list: `${API_BASE}/prets`,
      show: (id: number | string) => `${API_BASE}/prets/${id}`,
      create: `${API_BASE}/prets`,
      update: (id: number | string) => `${API_BASE}/prets/${id}`,
      delete: (id: number | string) => `${API_BASE}/prets/${id}`,
      validate: (id: number | string) => `${API_BASE}/prets/${id}/valider`,
      refuse: (id: number | string) => `${API_BASE}/prets/${id}/refuse`,
      start: (id: number | string) => `${API_BASE}/prets/${id}/demarrer`,
      settle: (id: number | string) => `${API_BASE}/prets/${id}/solde`
    },
    frais: {
      list: `${API_BASE}/api/admin/frais`,
      get: (id: string | number | undefined) =>
        `${API_BASE}/api/admin/frais/${id}`,
      create: `${API_BASE}/api/admin/frais`,
      update: (id: string | number) => `${API_BASE}/api/admin/frais/${id}`,
      delete: (id: string | number) => `${API_BASE}/api/admin/frais/${id}`,
      validate: (id: string | number) =>
        `${API_BASE}/api/admin/frais/${id}/validate`,
      submit: (id: string | number) =>
        `${API_BASE}/api/admin/frais/${id}/submit`
    },
    parametres: {
      parametreMaxGeneral: {
        list: `${API_BASE}/parametre-max-general`,
        create: `${API_BASE}/parametre-max-general`,
        show: (id: number | string) =>
          `${API_BASE}/parametre-max-general/${id}`,
        update: (id: number | string) =>
          `${API_BASE}/parametre-max-general/${id}`,
        delete: (id: number | string) =>
          `${API_BASE}/parametre-max-general/${id}`
      },
      departements: {
        list: `${API_BASE}/settings/departements`,
        create: `${API_BASE}/settings/departements`,
        show: (id: number | string) =>
          `${API_BASE}/settings/departements/${id}`,
        update: (id: number | string) =>
          `${API_BASE}/settings/departements/${id}`,
        delete: (id: number | string) =>
          `${API_BASE}/settings/departements/${id}`,
        activate: (id: number | string) =>
          `${API_BASE}/settings/departements/${id}/activate`,
        deactivate: (id: number | string) =>
          `${API_BASE}/settings/departements/${id}/deactivate`
      },
      postes: {
        list: `${API_BASE}/settings/postes`,
        create: `${API_BASE}/settings/postes`,
        show: (id: number | string) => `${API_BASE}/settings/postes/${id}`,
        update: (id: number | string) => `${API_BASE}/settings/postes/${id}`,
        delete: (id: number | string) => `${API_BASE}/settings/postes/${id}`,
        activate: (id: number | string) =>
          `${API_BASE}/settings/postes/${id}/activate`,
        deactivate: (id: number | string) =>
          `${API_BASE}/settings/postes/${id}/deactivate`
      },
      emplois: {
        list: `${API_BASE}/settings/emplois`,
        create: `${API_BASE}/settings/emplois`,
        show: (id: number | string) => `${API_BASE}/settings/emplois/${id}`,
        update: (id: number | string) => `${API_BASE}/settings/emplois/${id}`,
        delete: (id: number | string) => `${API_BASE}/settings/emplois/${id}`,
        activate: (id: number | string) =>
          `${API_BASE}/settings/emplois/${id}/activate`,
        deactivate: (id: number | string) =>
          `${API_BASE}/settings/emplois/${id}/deactivate`
      },
      metiers: {
        list: `${API_BASE}/settings/metiers`,
        create: `${API_BASE}/settings/metiers`,
        show: (id: number | string) => `${API_BASE}/settings/metiers/${id}`,
        update: (id: number | string) => `${API_BASE}/settings/metiers/${id}`,
        delete: (id: number | string) => `${API_BASE}/settings/metiers/${id}`,
        activate: (id: number | string) =>
          `${API_BASE}/settings/metiers/${id}/activate`,
        deactivate: (id: number | string) =>
          `${API_BASE}/settings/metiers/${id}/deactivate`
      }
    },
    accidentsTravail: {
      list: `${API_BASE}/accidents-travail`,
      create: `${API_BASE}/accidents-travail`,
      show: (id: number | string) => `${API_BASE}/accidents-travail/${id}`,
      update: (id: number | string) => `${API_BASE}/accidents-travail/${id}`,
      delete: (id: number | string) => `${API_BASE}/accidents-travail/${id}`,
      declarerCNSS: (id: number | string) =>
        `${API_BASE}/accidents-travail/${id}/declarer-cnss`,
      decisionCNSS: (id: number | string) =>
        `${API_BASE}/accidents-travail/${id}/decision-cnss`,
      cloturer: (id: number | string) =>
        `${API_BASE}/accidents-travail/${id}/cloturer`,
      suiviMedical: (id: number | string) =>
        `${API_BASE}/accidents-travail/${id}/suivi-medical`,
      piecesJointes: (id: number | string) =>
        `${API_BASE}/accidents-travail/${id}/pieces-jointes`,
      relances: (id: number | string) =>
        `${API_BASE}/accidents-travail/${id}/relances`,
      statistiques: `${API_BASE}/accidents-travail/statistiques`
    }
  }
};

export type ApiRoutes = typeof apiRoutes;
