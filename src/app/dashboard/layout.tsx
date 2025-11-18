// src/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from "react";
import { Footer } from "@/components/footer";
import { ClientThemeProviderWrapper } from "@/components/ClientThemeProviderWrapper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir silenciosamente al login si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Mientras se valida la sesión o no hay sesión, no renderizamos nada
  if (status === "loading" || status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <ClientThemeProviderWrapper>
        <main className="flex-1">{children}</main>
        <Footer />
      </ClientThemeProviderWrapper>
    </div>
  );
}