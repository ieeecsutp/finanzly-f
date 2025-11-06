// services/apiService.ts
import axios from "axios";
import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para las cookies
});

// Interceptor para añadir el token automáticamente
axiosInstance.interceptors.request.use(
  async (config) => {
    // Obtener la sesión de NextAuth
    const session = await getSession();
    
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el token expiró (401), NextAuth lo refrescará automáticamente
    if (error.response?.status === 401) {
      // Reintenta obtener una nueva sesión
      const session = await getSession();
      
      if (session?.accessToken) {
        // Reintentar la petición original con el nuevo token
        error.config.headers.Authorization = `Bearer ${session.accessToken}`;
        return axiosInstance.request(error.config);
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  get: (url: string, config = {}) => axiosInstance.get(url, config),
  post: (url: string, data = {}, config = {}) => axiosInstance.post(url, data, config),
  put: (url: string, data = {}, config = {}) => axiosInstance.put(url, data, config),
  delete: (url: string, config = {}) => axiosInstance.delete(url, config),
};
