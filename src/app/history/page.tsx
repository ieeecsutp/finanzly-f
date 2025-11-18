"use client";

import React from 'react';
import { Sidebar } from "@/components/sidebar";
import { HistoryRefresh } from "@/components/HistoryRefresh";
import { useSession } from "next-auth/react";
import { withAuth } from "@/components/withAuth";

function HistoryPage() {
  const { data: session } = useSession();

  return (
    <div className="font-sans text-gray-800 bg-black-50 min-h-screen">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64">
          <Sidebar />
        </div>

        <section className="flex-1 bg-gray-100 p-6">
          <HistoryRefresh 
            userName={session?.user?.nombre}
            userEmail={session?.user?.correo}
          />
        </section>
      </div>
    </div>
  );
}

export default withAuth(HistoryPage);
