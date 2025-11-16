"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/apiService";
import Head from "next/head";

export default function ForgotPassword() {
  const [correo, setCorreo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.post("/auth/forgot-password", {
        correo,
      });

      // En desarrollo, el backend retorna el token en la respuesta
      if (response.data?.token) {
        setToken(response.data.token);
      }

      setSuccess(true);
      
      // No redirigimos automáticamente: mostramos instrucciones claras.
      if (response.data?.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al procesar la solicitud. Verifica tu correo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push("/login");
  };

  const copyTokenToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert("Token copiado al portapapeles");
    }
  };

  const copyLinkToClipboard = () => {
    if (resetUrl) {
      navigator.clipboard.writeText(resetUrl);
      alert("Enlace copiado al portapapeles");
    }
  };

  const openResetLink = () => {
    if (resetUrl) {
      window.open(resetUrl, "_blank");
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar Contraseña</title>
        <meta name="description" content="Recuperar contraseña" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center pt-16">
        <div className="register-container relative z-10 bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Recuperar Contraseña
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Ingresa tu correo electrónico para recibir un enlace de recuperación
          </p>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium mb-2">
                  ✅ Solicitud procesada exitosamente
                </p>
                <p className="text-green-600 text-sm">
                  Se ha enviado un correo a {correo} con un enlace para restablecer tu contraseña. Revisa tu bandeja y la carpeta de spam.
                </p>
              </div>

              {token && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 font-medium mb-2">
                    🔐 Token de Recuperación (desarrollo)
                  </p>
                  <div className="bg-white border border-blue-300 rounded p-2 mb-2 break-all">
                    <code className="text-xs text-gray-700">{token}</code>
                  </div>
                  <button
                    type="button"
                    onClick={copyTokenToClipboard}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
                  >
                    📋 Copiar Token
                  </button>
                  <p className="text-blue-600 text-xs mt-2">
                    Este token es válido por 1 hora y se usa para cambiar tu contraseña.
                  </p>
                </div>
              )}

              {resetUrl && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-indigo-700 font-medium mb-2">🔗 Enlace de Recuperación (desarrollo)</p>
                  <div className="bg-white border border-indigo-300 rounded p-2 mb-2 break-all">
                    <code className="text-xs text-gray-700">{resetUrl}</code>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={copyLinkToClipboard}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
                    >
                      📋 Copiar Enlace
                    </button>
                    <button
                      type="button"
                      onClick={openResetLink}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
                    >
                      ↗ Abrir Enlace
                    </button>
                  </div>
                  <p className="text-indigo-600 text-xs mt-2">El enlace será válido por 1 hora.</p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-sm">
                  📧 Si no ves el correo, revisa tu carpeta de spam.
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  El enlace será válido por 1 hora.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoBack}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Ir al Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">❌ {error}</p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="correo" className="block text-gray-700 mb-2 font-semibold">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="text-center mt-6 space-x-4">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !correo}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  {isLoading ? "Procesando..." : "Enviar Enlace"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
