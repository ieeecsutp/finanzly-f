"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/services/apiService";
import Head from "next/head";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak");

  useEffect(() => {
    if (!token) {
      setError("Token inválido o no proporcionado");
    }
  }, [token]);

  // Validar fortaleza de contraseña
  useEffect(() => {
    const password = formData.newPassword;
    let strength: "weak" | "medium" | "strong" = "weak";

    if (password.length >= 8) {
      let hasUpperCase = /[A-Z]/.test(password);
      let hasNumber = /[0-9]/.test(password);
      let hasSpecialChar = /[!@#$%^&*]/.test(password);

      if ((hasUpperCase && hasNumber) || hasSpecialChar) {
        strength = "strong";
      } else if (hasUpperCase || hasNumber) {
        strength = "medium";
      }
    }

    setPasswordStrength(strength);
  }, [formData.newPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validaciones
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      setError("La contraseña debe contener al menos una mayúscula");
      setIsLoading(false);
      return;
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      setError("La contraseña debe contener al menos un número");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      await apiService.post("/auth/reset-password", {
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al cambiar la contraseña"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Restablecer Contraseña</title>
        <meta name="description" content="Restablecer contraseña" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center pt-16">
        <div className="register-container relative z-10 bg-white rounded-xl shadow-2xl p-8 w-full max-w-md mx-4">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Restablecer Contraseña
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Ingresa tu nueva contraseña
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium">
                ✅ Contraseña actualizada exitosamente
              </p>
              <p className="text-green-600 text-sm mt-2">
                Redirigiendo a inicio de sesión...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">❌ {error}</p>
                </div>
              )}

              {!token && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-700 text-sm">
                    ⚠️ Token inválido. Por favor solicita un nuevo enlace.
                  </p>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="newPassword" className="block text-gray-700 mb-2 font-semibold">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {formData.newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength === "weak"
                            ? "w-1/3 bg-red-500"
                            : passwordStrength === "medium"
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        passwordStrength === "weak"
                          ? "text-red-500"
                          : passwordStrength === "medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {passwordStrength === "weak"
                        ? "Débil"
                        : passwordStrength === "medium"
                        ? "Media"
                        : "Fuerte"}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Requisitos: Mínimo 8 caracteres, al menos 1 mayúscula y 1 número
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-semibold">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Repite la contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="text-xs text-green-500 mt-1">✓ Las contraseñas coinciden</p>
                )}
              </div>

              <div className="text-center mt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !token ||
                    !formData.newPassword ||
                    !formData.confirmPassword ||
                    formData.newPassword !== formData.confirmPassword
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  {isLoading ? "Procesando..." : "Cambiar Contraseña"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
