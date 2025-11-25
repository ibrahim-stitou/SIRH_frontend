const API_BASE = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
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
    resetPassword: `${API_BASE}/reset-password`,
  },

  files: {
    uploadTemp: `${API_BASE}/files/upload-temp`,
    cleanupTemp: `${API_BASE}/files/cleanup-temp`,
  },

  common: {
    profile: {
      get: `${API_BASE}/user`,
      update: `${API_BASE}/profile`,
      changePassword: `${API_BASE}/password`,
    },
    debug: `${API_BASE}/debug-user`,
  },

  admin: {
    users: {
      list: `${API_BASE}/users`,
      delete: (id: number | string) => `${API_BASE}/users/${id}`,
      details: (id: number | string) => `${API_BASE}/users/${id}`,
      update: (id: number | string) => `${API_BASE}/users/${id}`,
    },
    employees: {
      list: `${API_BASE}/hrEmployees`,
      delete: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      details: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
      update: (id: number | string) => `${API_BASE}/hrEmployees/${id}`,
    },
    media: {
      list: `${API_BASE}/userMedia`,
      details: (id: number | string) => `${API_BASE}/userMedia/${id}`,
    }
  }
};

export type ApiRoutes = typeof apiRoutes;
