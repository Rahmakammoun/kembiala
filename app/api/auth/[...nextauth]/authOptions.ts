// app/api/auth/[...nextauth]/authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import { compare } from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Récupération de l'utilisateur par email
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        })
        // Vérifie si l'utilisateur existe
        if (!user || !user.password) throw new Error("Email incorrect")

          // Vérifie le mot de passe (hashé)
        const isValid = await compare(credentials!.password, user.password)
        if (!isValid) throw new Error("Mot de passe incorrect")

          // Si ok, retourne un objet utilisateur minimal
        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id
        session.user.role = token.role
        session.token = token
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id)
        token.role = user.role
      }
      console.log("💥 JWT token :", token)
      return token
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}