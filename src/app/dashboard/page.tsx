"use client";
import React from 'react';
import HistorialRegistros from "@/components/HistorialRegistros";
import { Sidebar } from "@/components/sidebar";
import BalanceSummary from "@/components/BalanceSummary";

export default function DashboardPage() {
  return (
    <div className="font-sans text-gray-800 bg-black-50 min-h-screen">
      <div className="flex">
        <Sidebar />
        <section className="flex-1 bg-gray-100 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <BalanceSummary />
          <div className="mt-6">
            <div className="p-6 bg-white rounded-2xl shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Historial de Transacciones</h2>
              <HistorialRegistros />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}