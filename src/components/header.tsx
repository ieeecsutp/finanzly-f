"use client";

import Link from "next/link";
import { NavButton } from "@/components/nav-button";
import { useEffect, useState } from "react";

export function Header() {
  const [hasSidebar, setHasSidebar] = useState(false);
  const [open, setOpen] = useState(false); // internal mobile menu when sidebar is absent

  useEffect(() => {
    // detect if the page includes the sidebar
    const el = document.getElementById('page-sidebar');
    setHasSidebar(!!el);
  }, []);

  const handleMobileClick = () => {
    if (hasSidebar) {
      // trigger the drawer
      window.dispatchEvent(new CustomEvent('toggleSidebar'));
    } else {
      // open the header's internal mobile menu
      setOpen((v) => !v);
    }
  };

  return (
    <header className="bg-white dark:bg-background shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link href="/" className="px-2 py-1 hover:opacity-80 transition">
          💰Finanzly
        </Link>
      </div>

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center space-x-3">
        <Link href="/#nosotros" className="text-gray-700 dark:text-foreground hover:text-blue-600 px-2 py-1">
          Nosotros
        </Link>
        <Link href="/#blog" className="text-gray-700 dark:text-foreground hover:text-blue-600 px-2 py-1">
          Blog
        </Link>
        <Link href="/#recursos" className="text-gray-700 dark:text-foreground hover:text-blue-600 px-2 py-1">
          Recursos
        </Link>

        <NavButton text="Iniciar Sesión" href="/login" variant="outline" />
        <NavButton text="Registrarse" href="/signup" variant="solid" />
      </nav>

      {/* Mobile controls: single button to toggle sidebar or internal menu */}
      <div className="sm:hidden flex items-center gap-2">
        <button
          onClick={handleMobileClick}
          aria-label="Abrir menú principal"
          className="p-2 rounded-md bg-gray-100"
        >
          ☰
        </button>
      </div>

      {/* Internal mobile menu (only when there's no page sidebar) */}
      {!hasSidebar && open && (
        <div className="sm:hidden absolute top-16 left-0 right-0 mt-3 space-y-2 px-2 bg-white shadow">
          <Link href="/#nosotros" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
            Nosotros
          </Link>
          <Link href="/#blog" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
            Blog
          </Link>
          <Link href="/#recursos" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
            Recursos
          </Link>
          <div className="flex flex-col gap-2 px-2">
            <NavButton text="Iniciar Sesión" href="/login" variant="outline" />
            <NavButton text="Registrarse" href="/signup" variant="solid" />
          </div>
        </div>
      )}
    </header>
  );
}
