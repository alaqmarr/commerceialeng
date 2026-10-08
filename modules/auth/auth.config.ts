/**
 * modules/auth/auth.config.ts
 * NextAuth options configuration and session retrieval helper.
 * Strictly under 200 lines.
 */

import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAdminByEmailWithPasswordQuery } from "./queries";
import { normalizeEmail } from "./auth.lib";

/**
 * Resilient admin retrieval with exponential backoff retry & timeout buffer.
 * Absorbs SQLite WAL busy contention and read-after-write commit delays.
 */
async function findAdminWithRetry(
  email: string,
  maxRetries = 3,
  timeoutMs = 4000
) {
  let lastError: unknown = null;
  const initialBackoffMs = 120;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const userPromise = getAdminByEmailWithPasswordQuery(email);
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Admin query timeout")), timeoutMs)
      );

      const user = await Promise.race([userPromise, timeoutPromise]);
      if (user) {
        return user;
      }

      // If record not immediately visible after recent write, backoff briefly
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, initialBackoffMs * attempt));
      }
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, initialBackoffMs * attempt));
      }
    }
  }

  if (lastError) {
    console.warn(`[NextAuth authorize] Admin lookup warning for ${email}:`, lastError);
  }
  return null;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@commercialeng.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = normalizeEmail(credentials.email);

        try {
          const user = await findAdminWithRetry(normalizedEmail);

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "Administrator",
          };
        } catch (error) {
          console.error("NextAuth authorize query error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "commercial-engineering-associates-dev-secret-key-32chars-min",
};

/**
 * Server-side helper to retrieve current authenticated session in Server Components and Route Handlers.
 */
export const getAuthSession = () => getServerSession(authOptions);
