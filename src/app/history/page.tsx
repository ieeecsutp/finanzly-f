"use client";

import React, { useEffect } from 'react';
import { Sidebar } from "@/components/sidebar";
import { HistoryRefresh } from "@/components/HistoryRefresh";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protección de ruta
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Manejar error de refresh token
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signIn();
    }
  }, [session]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="font-sans text-gray-800 bg-black-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // No authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="font-sans text-gray-800 bg-black-50 min-h-screen">
      <div className="flex">
        <Sidebar />
        
        <section className="flex-1 bg-gray-100 p-6">
          <HistoryRefresh 
            userName={session.user?.nombre}
            userEmail={session.user?.correo}
          />
        </section>
      </div>
    </div>
  );
}
