"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function ProtectedPage(props: P) {
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="));

      if (!token) {
        router.push("/login"); // 🚫 redirigir si no hay token
      } else {
        setIsAuth(true);
      }
    }, [router]);

    if (!isAuth) {
      return (
        <main className="flex items-center justify-center h-screen">
          <p className="text-gray-600">Verificando sesión...</p>
        </main>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
