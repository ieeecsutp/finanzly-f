"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Asegúrate que exista

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    alert(`Registrando usuario: ${formData.name} - ${formData.email}`);
    // Aquí iría tu lógica para enviar datos a la API
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: formData.name,
            correo: formData.email,
            contraseña: formData.password,
          })
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (result.status === "success") {

          // Redirigir al login
          const redirectUrl = result.data.redirectTo || "/login";
          router.push(redirectUrl);
        } else {
          setError(result.message || "Error en el registro");
        }
      } else {
        // Manejar errores HTTP
        const errorData = await response.json();
        setError(errorData.message || `Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <main className="bg-blue-200 min-h-screen flex items-center justify-center py-8 sm:py-16 px-4">
        <div className="relative z-10 bg-white/90 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg mx-2">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Regístrate</h1>
          <p className="text-center mb-6 text-gray-600">Crea una cuenta para acceder a nuestros servicios</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <Button type="submit" className="w-full">¡Iniciemos!</Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </main>
  );
}
