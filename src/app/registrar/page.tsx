"use client";

import { Sidebar } from "@/components/sidebar"; 
import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react"; // ✅ Importar NextAuth
import { useRouter } from "next/navigation";
import { PlusCircle, DollarSign, FileText } from "lucide-react";
import { useCategorias } from "@/hooks/useApi";
import { apiService } from "@/services/apiService";
import { withAuth } from "@/components/withAuth";

function RegistrarPage() {
  const { data: session, status } = useSession(); // ✅ Obtener sesión
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    tipo: "",
    idCategoria: "",
    descripcion: "",
    monto: "",
    fechaRegistro: new Date().toISOString().split("T")[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { categorias, fetchCategorias, loading: isLoadingCategorias } = useCategorias();

  // ✅ Manejar error de refresh token
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn(); // Forzar re-login si el refresh token falló
    }
  }, [session]);

  // Fetch de categorías al montar el componente
  useEffect(() => {
    if (status === "authenticated") {
      fetchCategorias();
    }
  }, [status]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "tipo" && { idCategoria: "" }),
    }));
  };

  const handleTipoSelect = (tipo: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo: tipo,
      idCategoria: "",
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const registroData = {
        id_categoria: parseInt(formData.idCategoria),
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        fecha_registro: formData.fechaRegistro
      };

      // ✅ apiService ya incluye el token automáticamente
      await apiService.post('/registros/usuario', registroData);

      setShowSuccess(true);
      setFormData({
        tipo: "",
        idCategoria: "",
        descripcion: "",
        monto: "",
        fechaRegistro: new Date().toISOString().split("T")[0],
      });

      // Mostrar mensaje corto y permanecer en la misma página (no redirigir)
      setTimeout(() => {
        setShowSuccess(false);
        // Se eliminó la redirección a /dashboard para mantener al usuario en la página
      }, 900);

      // Notificar a otros componentes que los registros cambiaron (para actualizar balances en dashboard)
      try {
        window.dispatchEvent(new Event('registrosUpdated'));
      } catch (e) {
        // En entornos donde no exista `window` (SSR) se ignora
      }
      
    } catch (err: any) {
      // ✅ Manejar específicamente error 401 (no autenticado)
      if (err.response?.status === 401) {
        setError('Tu sesión expiró. Por favor, inicia sesión nuevamente.');
        setTimeout(() => signIn(), 2000);
      } else {
        setError(err.response?.data?.message || err.message || 'Error al guardar');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      tipo: "",
      idCategoria: "",
      descripcion: "",
      monto: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
    });
  };

  const isFormValid =
    formData.tipo &&
    formData.idCategoria &&
    formData.descripcion &&
    formData.monto &&
    formData.fechaRegistro;

  return (
    <main className="font-sans text-gray-800 bg-black-50 min-h-screen">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64">
          <Sidebar />
        </div>

        <section className="flex-1 bg-gray-100 p-6">
          <h1 className="text-2xl font-bold mb-4">Nuevo Registro</h1>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl shadow-md">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <p className="text-green-800 font-medium">
                  ¡Registro guardado exitosamente!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario Principal */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-white rounded-xl shadow-md space-y-6">
                {/* Tipo de Transacción */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Tipo de Transacción
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => handleTipoSelect("ingreso")}
                      className={`p-4 rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                        formData.tipo === "ingreso"
                          ? "bg-green-500 text-white"
                          : "bg-white hover:bg-green-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`p-2 rounded-full ${
                            formData.tipo === "ingreso"
                              ? "bg-white bg-opacity-20"
                              : "bg-green-100"
                          }`}
                        >
                          <PlusCircle
                            className={`w-6 h-6 ${
                              formData.tipo === "ingreso"
                                ? "text-white"
                                : "text-green-600"
                            }`}
                          />
                        </div>
                        <span className="font-semibold">📈 Ingreso</span>
                      </div>
                    </div>

                    <div
                      onClick={() => handleTipoSelect("gasto")}
                      className={`p-4 rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
                        formData.tipo === "gasto"
                          ? "bg-red-500 text-white"
                          : "bg-white hover:bg-red-50 text-gray-700 border border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`p-2 rounded-full ${
                            formData.tipo === "gasto"
                              ? "bg-white bg-opacity-20"
                              : "bg-red-100"
                          }`}
                        >
                          <DollarSign
                            className={`w-6 h-6 ${
                              formData.tipo === "gasto"
                                ? "text-white"
                                : "text-red-600"
                            }`}
                          />
                        </div>
                        <span className="font-semibold">📉 Gasto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label
                    htmlFor="categoria"
                    className="block text-lg font-semibold text-gray-800 mb-2"
                  >
                    🏷️ Categoría
                  </label>
                  <select
                    id="categoria"
                    name="idCategoria"
                    value={formData.idCategoria}
                    onChange={handleInputChange}
                    disabled={!formData.tipo || isLoadingCategorias}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed shadow-sm"
                  >
                    <option value="">
                      {isLoadingCategorias
                        ? "Cargando categorías..."
                        : formData.tipo
                        ? "Selecciona una categoría"
                        : "Primero selecciona el tipo"}
                    </option>
                    {formData.tipo &&
                      !isLoadingCategorias &&
                      categorias[formData.tipo as keyof typeof categorias]?.map(
                        (categoria) => (
                          <option key={categoria.id_categoria} value={categoria.id_categoria}>
                            {categoria.nombre}
                          </option>
                        )
                      )}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label
                    htmlFor="descripcion"
                    className="block text-lg font-semibold text-gray-800 mb-2"
                  >
                    📝 Descripción
                  </label>
                  <input
                    type="text"
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Ej: Compra en supermercado, Pago de consultoría..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  />
                </div>

                {/* Monto y Fecha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="monto"
                      className="block text-lg font-semibold text-gray-800 mb-2"
                    >
                      💰 Monto (S/)
                    </label>
                    <input
                      type="number"
                      id="monto"
                      name="monto"
                      value={formData.monto}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fechaRegistro"
                      className="block text-lg font-semibold text-gray-800 mb-2"
                    >
                      📅 Fecha
                    </label>
                    <input
                      type="date"
                      id="fechaRegistro"
                      name="fechaRegistro"
                      value={formData.fechaRegistro}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleReset}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-sm"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isSubmitting}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md ${
                      isFormValid && !isSubmitting
                        ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Guardar Registro</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div className="lg:col-span-1">
              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📋 Vista Previa
                </h3>

                {isFormValid ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl ${
                        formData.tipo === "ingreso"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            formData.tipo === "ingreso"
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {formData.tipo === "ingreso"
                            ? "📈 Ingreso"
                            : "📉 Gasto"}
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            formData.tipo === "ingreso"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          S/{formData.monto}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <span className="font-semibold">Categoría:</span>{" "}
                          {
                            [...categorias.ingreso, ...categorias.gasto].find(
                              (cat) =>
                                cat.id_categoria.toString() === formData.idCategoria
                            )?.nombre || "Sin categoría"
                          }
                        </p>
                        <p>
                          <span className="font-semibold">Descripción:</span>{" "}
                          {formData.descripcion}
                        </p>
                          <p>
                          <span className="font-semibold">Fecha:</span>{" "}
                          {formData.fechaRegistro}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Completa el formulario para ver la vista previa</p>
                  </div>
                )}
              </div>

              {/* Resumen de balance */}
              {formData.tipo && formData.monto && (
                <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    📊 Impacto en tu Balance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Balance Actual:</span>
                      <span className="font-bold text-green-600">S/2,500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {formData.tipo === "ingreso"
                          ? "Nuevo Ingreso:"
                          : "Nuevo Gasto:"}
                      </span>
                      <span
                        className={`font-bold ${
                          formData.tipo === "ingreso"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {formData.tipo === "ingreso" ? "+" : "-"}S/
                        {formData.monto}
                      </span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">
                        Nuevo Balance:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        S/
                        {formData.tipo === "ingreso"
                          ? (2500 + parseFloat(formData.monto || "0")).toFixed(2)
                          : (2500 - parseFloat(formData.monto || "0")).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default withAuth(RegistrarPage);
