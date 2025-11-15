// components/HistoryRefresh.tsx
"use client";

import React from 'react';
import { useRefreshHistory } from '@/hooks/useRefreshHistory';
import { Clock, Calendar, RefreshCw, Shield, AlertCircle } from 'lucide-react';

interface HistoryRefreshProps {
  userName?: string;
  userEmail?: string;
}

export function HistoryRefresh({ userName, userEmail }: HistoryRefreshProps) {
  const { history, loading, error, refetch } = useRefreshHistory();

  // Formatear fecha desde ISO string a formato legible
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return isoString;
    }
  };

  // Formatear solo la fecha (sin hora) para las estadísticas
  const formatDateShort = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Calcular días restantes desde ISO string
  const getDaysRemaining = (isoString: string) => {
    try {
      const now = new Date();
      const expiration = new Date(isoString);
      const diffTime = expiration.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Calcular horas restantes (útil para tokens que expiran pronto)
  const getHoursRemaining = (isoString: string) => {
    try {
      const now = new Date();
      const expiration = new Date(isoString);
      const diffTime = expiration.getTime() - now.getTime();
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return diffHours;
    } catch {
      return null;
    }
  };

  // Obtener color del estado
  const getStatusColor = (daysRemaining: number | null) => {
    if (daysRemaining === null) return 'gray';
    if (daysRemaining <= 0) return 'red';
    if (daysRemaining <= 2) return 'orange';
    if (daysRemaining <= 5) return 'yellow';
    return 'green';
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (isoString: string) => {
    const days = getDaysRemaining(isoString);
    const hours = getHoursRemaining(isoString);
    
    if (days === null) return 'Verificando...';
    if (days <= 0) return 'Expirado';
    if (days === 1 && hours && hours <= 24) return `${hours} horas restantes`;
    if (days === 1) return '1 día restante';
    return `${days} días restantes`;
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Historial de Sesiones
            </h1>
            <p className="text-gray-600">
              Revisa todas tus sesiones activas y tokens de autenticación
            </p>
          </div>
          
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* User Info Card */}
      {(userName || userEmail) && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              {userName && <h2 className="text-2xl font-bold">{userName}</h2>}
              {userEmail && <p className="text-blue-100">{userEmail}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-md">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando historial...</p>
          </div>
        </div>
      )}

      {/* History List */}
      {!loading && !error && (
        <>
          {history.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay historial disponible
              </h3>
              <p className="text-gray-500">
                Aún no se han registrado sesiones en tu cuenta
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Total de Sesiones</p>
                      <p className="text-3xl font-bold text-gray-800">{history.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Sesión Más Reciente</p>
                      <p className="text-sm font-bold text-gray-800">
                        {history.length > 0 ? formatDateShort(history[0].fechaCreacion) : 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Próxima Expiración</p>
                      <p className="text-sm font-bold text-gray-800">
                        {history.length > 0 
                          ? getStatusLabel(history[0].fechaExpiracion)
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* History Cards */}
              <div className="space-y-3">
                {history.map((entry, index) => {
                  const daysRemaining = getDaysRemaining(entry.fechaExpiracion);
                  const statusColor = getStatusColor(daysRemaining);
                  const statusLabel = getStatusLabel(entry.fechaExpiracion);
                  
                  return (
                    <div
                      key={`${entry.fechaCreacion}-${index}`}
                      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            statusColor === 'green' ? 'bg-green-100' :
                            statusColor === 'yellow' ? 'bg-yellow-100' :
                            statusColor === 'orange' ? 'bg-orange-100' :
                            statusColor === 'red' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            <Shield className={`w-6 h-6 ${
                              statusColor === 'green' ? 'text-green-600' :
                              statusColor === 'yellow' ? 'text-yellow-600' :
                              statusColor === 'orange' ? 'text-orange-600' :
                              statusColor === 'red' ? 'text-red-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                              Sesión #{history.length - index}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="break-all">
                                  <span className="font-medium">Inicio:</span> {formatDate(entry.fechaCreacion)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span className="break-all">
                                  <span className="font-medium">Expira:</span> {formatDate(entry.fechaExpiracion)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                            statusColor === 'green' ? 'bg-green-100 text-green-700' :
                            statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            statusColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                            statusColor === 'red' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
