"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
      // Si aún está cargando, no hacemos nada
      if (status === "loading") {
        return;
      }

      // Si no hay sesión o el token tiene error, redirigir a login silenciosamente
      if (status === "unauthenticated" || !session?.accessToken) {
        router.push("/login");
        return;
      }

      // Si hay sesión válida, permitir acceso
      if (status === "authenticated" && session?.user) {
        setIsAuth(true);
      }
    }, [status, session, router]);

    // Renderizar el componente solo si está autenticado
    // Si no, simplemente renderiza null (sin mostrar nada)
    if (!isAuth) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
