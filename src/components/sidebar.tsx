"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLElement | null>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);
  const mainContentRef = React.useRef<HTMLElement | null>(null);
  const [isVerySmall, setIsVerySmall] = React.useState(false);

  React.useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);

    window.addEventListener('toggleSidebar', toggle as EventListener);
    window.addEventListener('openSidebar', openHandler as EventListener);
    window.addEventListener('closeSidebar', closeHandler as EventListener);

    return () => {
      window.removeEventListener('toggleSidebar', toggle as EventListener);
      window.removeEventListener('openSidebar', openHandler as EventListener);
      window.removeEventListener('closeSidebar', closeHandler as EventListener);
    };
  }, []);

  // detect very small screens to render dropdown-style panel
  React.useEffect(() => {
    const check = () => setIsVerySmall(window.innerWidth <= 480);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Manage focus trap + keyboard handling when the drawer opens
  React.useEffect(() => {
    const panel = panelRef.current;
    let mainEl: HTMLElement | null = null;

    const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!panel) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === 'Tab') {
        const nodes = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(n => !n.hasAttribute('disabled'));
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (!active || active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    if (open) {
      // store previously focused element to restore later
      previouslyFocused.current = document.activeElement as HTMLElement | null;

      // hide main content from assistive tech
      mainEl = document.querySelector('main');
      if (mainEl) {
        mainContentRef.current = mainEl;
        mainEl.setAttribute('aria-hidden', 'true');
      }

      // prevent body scroll while open
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // focus first focusable in panel after it's visible
      requestAnimationFrame(() => {
        if (panel) {
          const nodes = panel.querySelectorAll<HTMLElement>(focusableSelector);
          if (nodes.length) nodes[0].focus();
        }
      });

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = prevOverflow;
        if (mainContentRef.current) mainContentRef.current.removeAttribute('aria-hidden');
        // restore focus
        if (previouslyFocused.current) previouslyFocused.current.focus();
      };
    }
    return;
  }, [open]);

  const handleLogout = async () => {
    try {
      // 1. Llamar al endpoint de logout del backend para revocar el refresh token
      await fetch("http://localhost:4000/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Incluir cookies para enviar el refresh token
      });
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error);
    } finally {
      // 2. Cerrar sesión en NextAuth (limpia la sesión del cliente)
      await signOut({
        redirect: true,
        callbackUrl: "/login"
      });
    }
  };

  return (
    <>
      {/* Desktop / large screens: static sidebar */}
      <aside id="page-sidebar" className="hidden sm:flex sm:flex-col sm:w-64 bg-[#D1ECF1] h-screen text-bold shadow-lg" aria-label="Navegación principal">
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <h1 className="text-lg font-bold">💰Finanzly</h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#B6FAFA]">🏦 <span>Dashboard</span></Link>
            </li>
            <li>
              <Link href="/registrar" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#B6FAFA]">💵 <span>Registrar</span></Link>
            </li>
            <li>
              <Link href="/history" className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#B6FAFA]">🕐 <span>Historial Sessión</span></Link>
            </li>
          </ul>
        </nav>

        <div className="mt-auto w-full p-4 border-t border-gray-700">
          <button onClick={handleLogout} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">⬅️ Cerrar sesión</button>
        </div>
      </aside>

      {/* Mobile drawer/dropdown: changes behavior based on screen size */}
      {isVerySmall ? (
        /* Very small screens: always-visible dropdown list */
        <aside
          className="sm:hidden w-full bg-[#D1ECF1] shadow-md border-b border-gray-300"
          aria-label="Menú de navegación móvil"
        >
          <div className="p-4 flex items-center justify-between border-b border-gray-700">
            <h1 className="text-lg font-bold">💰Finanzly</h1>
          </div>

          <nav className="p-4">
            <ul className="space-y-1">
              {/* Header links integrated into the drawer for mobile */}
              <li>
                <Link href="/#nosotros" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/#blog" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/#recursos" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                  Recursos
                </Link>
              </li>

              {/* Separator line */}
              <li className="border-t border-gray-300 my-2"></li>

              <li>
                <Link href="/dashboard" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                  <span>🏦</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/registrar" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                  <span>💵</span>
                  <span>Registrar</span>
                </Link>
              </li>
              <li>
                <Link href="/history" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                  <span>🕐</span>
                  <span>Historial Sessión</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-auto w-full p-4 border-t border-gray-700">
            <button onClick={async () => { await handleLogout(); }} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 8v8" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </aside>
      ) : (
        /* Larger mobile screens: modal drawer with backdrop */
        <div className={`sm:hidden fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <aside
            ref={panelRef}
            role="dialog"
            aria-modal={open ? "true" : "false"}
            aria-label="Menú de navegación"
            className={`fixed top-0 left-0 h-full w-11/12 max-w-xs sm:hidden bg-[#D1ECF1] shadow-lg transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'} flex flex-col max-h-full overflow-auto`}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-700">
              <h1 className="text-lg font-bold">💰Finanzly</h1>
            </div>

            <nav className="p-4">
              <ul className="space-y-1">
                {/* Header links integrated into the drawer for mobile */}
                <li>
                  <Link href="/#nosotros" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/#blog" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/#recursos" className="block text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                    Recursos
                  </Link>
                </li>

                {/* Separator line */}
                <li className="border-t border-gray-300 my-2"></li>

                <li>
                  <Link href="/dashboard" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                    <span>🏦</span>
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/registrar" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                    <span>💵</span>
                    <span>Registrar</span>
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 px-2 py-2 rounded">
                    <span>🕐</span>
                    <span>Historial Sessión</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mt-auto w-full p-4 border-t border-gray-700">
              <button onClick={async () => { await handleLogout(); }} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 8v8" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

