// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
  };
  refresh_token: string;
}

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch("http://localhost:4000/api/v1/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify({
        refresh_token: token.refreshToken
      })
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.data.access_token,
      accessTokenExpires: Date.now() + 15 * 60 * 1000,
      refreshToken: refreshedTokens.data.refresh_token,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        correo: { label: "Correo", type: "email" },
        contraseña: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.correo || !credentials?.contraseña) {
          return null;
        }

        try {
          const response = await fetch("http://localhost:4000/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              correo: credentials.correo,
              contraseña: credentials.contraseña,
            }),
          });

          const data = await response.json();

          if (!response.ok || data.status !== "success") {
            return null;
          }

          const loginData: LoginResponse = data.data;

          return {
            id: loginData.usuario.id.toString(),
            name: loginData.usuario.nombre,
            email: loginData.usuario.correo,
            accessToken: loginData.access_token,
            refreshToken: loginData.refresh_token,
          } as any;
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000,
          user: {
            id: user.id,
            nombre: user.name,
            correo: user.email,
          },
        };
      }

      // Verificar si hay un error previo (token revocado, etc)
      if (token.error) {
        return token;
      }

      // Si el access token aún es válido, devolver el token sin refrescarlo
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // El access token expiró, intentar refrescar
      try {
        const refreshedToken = await refreshAccessToken(token);
        
        // Si hay error de refresh, marcar el token
        if (refreshedToken.error) {
          return {
            ...refreshedToken,
            error: "RefreshAccessTokenError",
          };
        }
        
        return refreshedToken;
      } catch (error) {
        console.error("Error refrescando token:", error);
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }) {
      // Si hay un error en el token, propagarlo a la sesión
      if (token.error) {
        session.error = token.error;
      } else {
        session.accessToken = token.accessToken;
        session.error = undefined;
      }
      
      session.user = token.user as any;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

// IMPORTANTE: Exportar GET y POST
export { handler as GET, handler as POST };
