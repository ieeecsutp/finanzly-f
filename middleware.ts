import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Leer token desde la cookie
  const token = req.cookies.get("token")?.value;

  // Rutas que requieren autenticación
  const protectedRoutes = ["/dashboard", "/registrar"];

  if (protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      // 🚫 Si no hay token → redirigir a login
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Aplica middleware solo a estas rutas
export const config = {
  matcher: ["/dashboard/:path*", "/registrar/:path*"],
};
