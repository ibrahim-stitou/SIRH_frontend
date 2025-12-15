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
      delete: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      details: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      update: (id: number | string) => `${API_BASE}/hrEmployees/${id}`
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
        cancel: (id: number | string) => `${API_BASE}/contracts/${id}/cancel`
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
      show: (id: number | string) => `${API_BASE}/sieges/${id}`
    }
  }
};

export type ApiRoutes = typeof apiRoutes;
