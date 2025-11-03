import { getSession } from "next-auth/react";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error("No hay sesión activa");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.accessToken}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token expiró, NextAuth lo refrescará en la próxima llamada a getSession()
  if (response.status === 401) {
    // Forzar actualización de la sesión
    const newSession = await getSession();
    if (newSession?.accessToken) {
      // Reintentar con el nuevo token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newSession.accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }
  }

  return response;
}
