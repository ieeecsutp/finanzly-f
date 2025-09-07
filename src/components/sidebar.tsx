"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    // ❌ Eliminar token guardado en cookie
    document.cookie = "token=; path=/; max-age=0";

    // Si usas localStorage o sessionStorage también:
    // localStorage.removeItem("token");
    // sessionStorage.removeItem("token");

    // 🔄 Redirigir al login
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#D1ECF1] h-screen text-bold transition-transform -translate-x-full sm:translate-x-0 shadow-lg">
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-lg font-bold">💰Finanzly</h1>
        <button className="sm:hidden p-2 text-gray-300 hover:bg-gray-700 rounded-lg">
          ✖
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#B6FAFA]"
            >
              🏦 <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              href="/registrar"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#B6FAFA]"
            >
              💵 <span>Registrar</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
        >
          ⬅️ Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
