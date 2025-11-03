import type { Metadata } from "next";
import "./globals.css";
// 1. Importa tu nuevo componente
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { ClientThemeProviderWrapper } from "@/components/ClientThemeProviderWrapper";
import { Providers } from "@/components/providers/session-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
            <ClientThemeProviderWrapper>
              <ConditionalLayout>
                <Providers>
                  {children}
                </Providers>
              </ConditionalLayout>
            </ClientThemeProviderWrapper>
      </body>
    </html>
  );
}