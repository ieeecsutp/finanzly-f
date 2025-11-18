"use client";
import React from 'react';
import HistorialRegistros from "@/components/HistorialRegistros";
import { Sidebar } from "@/components/sidebar";
import BalanceSummary from "@/components/BalanceSummary";
import { withAuth } from "@/components/withAuth";

function DashboardPage() {
  return (
    <div className="font-sans text-gray-800 bg-black-50 min-h-screen">
      {/* mobile: column (sidebar on top), desktop: row */}
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-64">
          <Sidebar />
        </div>

        <section className="flex-1 bg-gray-100 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <div className="mb-6">
              <BalanceSummary />
            </div>

            <div className="mt-6">
              <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md overflow-x-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Transacciones</h2>
                <HistorialRegistros />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);