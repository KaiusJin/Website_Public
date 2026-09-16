export const useCMSData = table => ({data: globalThis.__cmsRows[table] || [], loading: false, error: null});
