// hooks/useRefreshHistory.ts
import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useSession } from 'next-auth/react';
import { HistoryEntry, HistoryResponse } from '@/types/refresh.types';


export const useRefreshHistory = () => {
  const { status } = useSession();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.get('/refresh/history');
      const data = response.data as HistoryResponse; 
      
      if (data.status === 'success') {
        const sortedHistory = data.data.sort((a, b) => {
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        });
        setHistory(sortedHistory);
      } else {
        setError(data.message || 'Error al obtener historial');
      }
    } catch (err: any) {
      console.error('Error fetching refresh history:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status]);

  return { history, loading, error, refetch: fetchHistory };
};
