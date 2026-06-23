import { create } from 'zustand';

interface AppState {
  user: any;
  users: any[];
  locations: any[];
  assets: any[];
  complaints: any[];
  clusters: any[];
  analytics: any;
  setUser: (user: any) => void;
  logout: () => void;
  setUsers: (users: any[]) => void;
  fetchGlobalState: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useStore = create<AppState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('campus_user') || 'null'),
  users: [],
  locations: [],
  assets: [],
  complaints: [],
  clusters: [],
  analytics: null,
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('campus_user', JSON.stringify(user));
      get().fetchGlobalState();
    } else {
      localStorage.removeItem('campus_user');
    }
  },
  logout: () => {
    localStorage.removeItem('campus_user');
    set({ user: null, complaints: [], clusters: [], analytics: null });
  },
  setUsers: (users) => set({ users }),
  login: async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const user = await res.json();
        get().setUser(user);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login failed', e);
      return false;
    }
  },
  fetchGlobalState: async () => {
    try {
      const user = get().user;
      const headers = user ? { 'x-user-id': user.id, 'x-user-role': user.role } as Record<string, string> : undefined;
      
      const [locs, asts, cmps, cls, anl] = await Promise.all([
        fetch(`${API_URL}/api/campus-map`).then(r => r.json()),
        fetch(`${API_URL}/api/assets`).then(r => r.json()),
        fetch(`${API_URL}/api/complaints`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/api/clusters`).then(r => r.json()),
        fetch(`${API_URL}/api/analytics`).then(r => r.json())
      ]);

      set({ locations: locs, assets: asts, complaints: cmps, clusters: cls, analytics: anl });
    } catch (e) {
      console.error('Failed to sync global state', e);
    }
  }
}));
