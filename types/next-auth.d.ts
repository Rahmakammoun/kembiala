
// types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: number
      email: string
      role: string
    }
    token?: {
      [key: string]: any
    }
  }

  interface User {
    id: number
    email: string
    role: string
  }
  
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    id: number
    email: string
    role: string
  }
}

