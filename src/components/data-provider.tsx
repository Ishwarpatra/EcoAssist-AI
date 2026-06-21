import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { useApi } from '../lib/api';

interface DashboardData {
  assessments: any[];
  goals: any[];
}

interface DataContextType {
  data: DashboardData | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  mutateData: (updater: (prev: DashboardData | null) => DashboardData | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { fetchWithAuth } = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const mutateData = (updater: (prev: DashboardData | null) => DashboardData | null) => {
    setData(prev => updater(prev));
  };

  const refreshData = async () => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth('/api/dashboard', token);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else if (res.status === 401 || res.status === 403) {
        // Handle auth error downstream
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return (
    <DataContext.Provider value={{ data, loading, refreshData, mutateData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
