import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder') && supabaseUrl.startsWith('http'));

let supabaseClient;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('[AI Studio] Fallback to Mock Supabase due to initialization error:', err);
  }
}

if (!supabaseClient) {
  console.warn('[AI Studio] Supabase is not configured or invalid. Falling back to Mock local database.');
  
  // Base state for mock
  let currentSession = null;
  const authListeners = new Set();

  // Try to load simulated session from localStorage
  const savedSession = localStorage.getItem('mock_supabase_session');
  if (savedSession) {
    try {
      currentSession = JSON.parse(savedSession);
    } catch (_) {}
  }

  // Local storage for routes
  const getSavedRoutes = () => {
    try {
      return JSON.parse(localStorage.getItem('mock_supabase_routes') || '[]');
    } catch (_) {
      return [];
    }
  };

  const saveRoutes = (routes) => {
    localStorage.setItem('mock_supabase_routes', JSON.stringify(routes));
  };

  supabaseClient = {
    auth: {
      getSession: async () => {
        return { data: { session: currentSession }, error: null };
      },
      onAuthStateChange: (callback) => {
        authListeners.add(callback);
        // Fire initial event
        callback('SIGNED_IN', currentSession);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(callback);
              }
            }
          }
        };
      },
      signInWithPassword: async ({ email, password }) => {
        const mockUser = {
          id: 'mock-user-1234',
          email: email || 'usuario@ejemplo.com',
        };
        currentSession = {
          user: mockUser,
          access_token: 'mock-token-abc',
        };
        localStorage.setItem('mock_supabase_session', JSON.stringify(currentSession));
        authListeners.forEach(cb => cb('SIGNED_IN', currentSession));
        return { data: { session: currentSession, user: mockUser }, error: null };
      },
      signUp: async ({ email, password }) => {
        const mockUser = {
          id: 'mock-user-1234',
          email: email || 'usuario@ejemplo.com',
        };
        currentSession = {
          user: mockUser,
          access_token: 'mock-token-abc',
        };
        localStorage.setItem('mock_supabase_session', JSON.stringify(currentSession));
        authListeners.forEach(cb => cb('SIGNED_IN', currentSession));
        return { data: { session: currentSession, user: mockUser }, error: null };
      },
      signOut: async () => {
        currentSession = null;
        localStorage.removeItem('mock_supabase_session');
        authListeners.forEach(cb => cb('SIGNED_OUT', null));
        return { error: null };
      }
    },
    from: (table) => {
      return {
        select: (columns) => {
          return {
            eq: (field, value) => {
              return {
                eq: (field2, value2) => {
                  return {
                    single: async () => {
                      if (table === 'saved_routes') {
                        const routes = getSavedRoutes();
                        const found = routes.find(r => r.item_id === value2);
                        return { data: found ? found : null, error: null };
                      }
                      return { data: null, error: null };
                    }
                  };
                },
                order: async (orderCol, orderOpts) => {
                  if (table === 'saved_routes') {
                    const routes = getSavedRoutes();
                    return { data: routes, error: null };
                  }
                  return { data: [], error: null };
                },
                single: async () => {
                  if (table === 'saved_routes') {
                    const routes = getSavedRoutes();
                    const found = routes.find(r => r.item_id === value);
                    return { data: found ? found : null, error: null };
                  }
                  return { data: null, error: null };
                }
              };
            }
          };
        },
        insert: async (records) => {
          if (table === 'saved_routes') {
            const routes = getSavedRoutes();
            const newRoutes = [...routes, ...records.map(r => ({ id: Math.random().toString(), ...r }))];
            saveRoutes(newRoutes);
          }
          return { error: null };
        },
        delete: () => {
          return {
            eq: (field, value) => {
              return {
                eq: async (field2, value2) => {
                  if (table === 'saved_routes') {
                    const routes = getSavedRoutes();
                    const filtered = routes.filter(r => r.item_id !== value2);
                    saveRoutes(filtered);
                  }
                  return { error: null };
                }
              };
            }
          };
        }
      };
    }
  };
}

export const supabase = supabaseClient;

