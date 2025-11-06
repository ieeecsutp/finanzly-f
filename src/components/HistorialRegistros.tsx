import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiService } from '@/services/apiService';
import { AxiosError } from 'axios';

interface RegistroItemRs {
    id_registro: number;
    tipo: 'ingreso' | 'gasto';
    descripcion: string;
    monto: number;
    fecha_registro: string;
    usuario: {
        id_usuario: number;
        nombre: string;
    };
    categoria: {
        id_categoria: number;
        nombre: string;
        tipo: 'ingreso' | 'gasto';
    };
}



export default function HistorialRegistros() {
    const { data: session } = useSession();
    const [registros, setRegistros] = useState<RegistroItemRs[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // [HU-06 Implícito] Función para obtener los registros del backend
    const fetchRegistros = async () => {
        setLoading(true);
        try {
            const response = await apiService.get('/registros');
            setRegistros(response.data.data || []); 
        } catch (error) {
            console.error("Error al cargar registros:", error);
            const err = error as AxiosError<{message: string}>;
            if (err.response?.status === 401) {
                setError("Sesión expirada. Por favor inicie sesión nuevamente.");
            } else if (err.response?.status === 500) {
                setError("Error del servidor. Por favor intente más tarde.");
            } else {
                setError(err.response?.data?.message || "Error al cargar los registros.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistros();
    }, []); 

    // [HU-05] Función para manejar la eliminación de un registro
    const handleDelete = async (id_registro: number) => {
        if (!window.confirm(`¿Estás seguro de eliminar el registro ID #${id_registro}? Esta acción es irreversible.`)) {
            return; 
        }

        try {
            const response = await apiService.delete(`/registros/${id_registro}`);
            alert(`Registro eliminado con éxito.`);
            // Refrescar listado localmente
            fetchRegistros();
            // Notificar al resto de la app que los registros cambiaron (para actualizar balances, etc.)
            try {
                window.dispatchEvent(new Event('registrosUpdated'));
            } catch (e) {
                // peticiones server-side o entornos sin window pueden fallar; silenciosamente ignorar
            }
        } catch (error) {
            const err = error as AxiosError<{message: string}>;
            if (err.response?.status === 401) {
                alert("Sesión expirada. Por favor inicie sesión nuevamente.");
            } else {
                alert(err.response?.data?.message || "Error al eliminar el registro.");
            }
        }
    };

    if (loading) return <div className="p-4 text-center text-blue-500">Cargando historial...</div>;
    if (error) return <div className="p-4 text-center text-red-500 font-bold">Error al cargar datos: {error}</div>;
    if (registros.length === 0) return <div className="p-4 text-center text-gray-500">Aún no tienes registros. Crea uno para empezar a ver el historial.</div>;

    return (
        <div className="overflow-x-auto shadow-xl rounded-lg bg-white p-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider">Fecha</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider">Descripción</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider">Categoría</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider">Tipo</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider">Monto (S/)</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600 tracking-wider">Acción</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {registros.map((registro) => {
                        const isIngreso = registro.tipo === 'ingreso';
                        const tipoClase = isIngreso ? 'text-green-600' : 'text-red-600';
                        const montoSimbolo = isIngreso ? '+' : '-';
                        const fechaFormateada = new Date(registro.fecha_registro).toLocaleDateString('es-PE');

                        return (
                            <tr key={registro.id_registro} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{fechaFormateada}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate text-center">{registro.descripcion}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{registro.categoria.nombre}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-center">
                                    <span className={tipoClase}>{registro.tipo.charAt(0).toUpperCase() + registro.tipo.slice(1)}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-center">
                                    <span className={tipoClase}>{montoSimbolo} S/{registro.monto.toFixed(2)}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(registro.id_registro)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded transition duration-150"
                                        title="Eliminar Registro"
                                    >
                                        {/* Ícono de Bote de Basura (SVG simple) */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}