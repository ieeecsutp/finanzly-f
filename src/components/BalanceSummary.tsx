import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiService } from '@/services/apiService';

interface BalanceSummaryProps {
  onBalanceUpdate?: (balance: number) => void;
}

export default function BalanceSummary({ onBalanceUpdate }: BalanceSummaryProps) {
  const { data: session } = useSession();
  const [balances, setBalances] = useState({
    total: 0,
    ingresosMensuales: 0,
    gastosMensuales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
    // Escuchar eventos globales que indiquen cambios en registros (creación/eliminación)
    const onRegistrosUpdated = () => {
      fetchBalances();
    };

    window.addEventListener('registrosUpdated', onRegistrosUpdated);

    return () => {
      window.removeEventListener('registrosUpdated', onRegistrosUpdated);
    };
  }, [session]);

  const fetchBalances = async () => {
    try {
      const response = await apiService.get('/registros/balances');
      const { data } = response.data;
      
      setBalances({
        total: data.balance_total || 0,
        ingresosMensuales: data.ingresos_mensuales || 0,
        gastosMensuales: data.gastos_mensuales || 0,
      });

      if (onBalanceUpdate) {
        onBalanceUpdate(data.balance_total || 0);
      }
    } catch (error) {
      console.error('Error al obtener balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-white rounded-xl shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-semibold">💰 Balance Total</h2>
        <p className="text-2xl font-bold text-green-600 mt-2">
          S/{balances.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-semibold">📉 Gastos Mensuales</h2>
        <p className="text-2xl font-bold text-red-500 mt-2">
          S/{balances.gastosMensuales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-semibold">📈 Ingresos Mensuales</h2>
        <p className="text-2xl font-bold text-green-500 mt-2">
          S/{balances.ingresosMensuales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}