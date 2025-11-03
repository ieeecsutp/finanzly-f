// hooks/useApi.ts
import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { Categorias } from '@/types/categoria.types';

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categorias>({
    ingreso: [],
    gasto: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Hacer ambas peticiones en paralelo
      const [ingresosRes, gastosRes] = await Promise.all([
        apiService.get('/categorias/tipo/ingreso'),
        apiService.get('/categorias/tipo/gasto')
      ]);

      setCategorias({
        ingreso: ingresosRes.data.data || [],
        gasto: gastosRes.data.data || []
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar categorías');
      console.error('Error fetching categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  return { categorias, fetchCategorias, loading, error };
};
