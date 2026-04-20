import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            userType: user.userType,
            phone: user.phone,
            university: user.university
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.userType = (user as any).userType;
        token.phone = (user as any).phone;
        token.university = (user as any).university;
      }

      if (trigger === "update" && session) {
        if ((session as any).name !== undefined) {
          token.name = (session as any).name;
        }
        if ((session as any).phone !== undefined) {
          token.phone = (session as any).phone;
        }
        if ((session as any).university !== undefined) {
          token.university = (session as any).university;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.name = (token.name as string) ?? session.user.name;
          session.user.email = (token.email as string) ?? session.user.email;
        }
        (session.user as any).id = token.sub;
        (session.user as any).userType = token.userType;
        (session.user as any).phone = token.phone;
        (session.user as any).university = token.university;
      }
      return session;
    }
  }
};
