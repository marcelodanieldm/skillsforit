import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { AuthService } from '@/lib/auth'

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),

    // Credentials Provider (email/password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const result = AuthService.login({
          email: credentials.email,
          password: credentials.password
        })

        if (!result.success || !result.user) {
          return null
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider === 'google') {
        // Auto-create user if doesn't exist
        const existingUser = AuthService.getAllUsers().find(u => u.email === user.email)
        
        if (!existingUser && user.email) {
          // Create new user with 'user' role by default
          AuthService.createUser({
            email: user.email,
            name: user.name || 'Usuario',
            role: 'user',
            password: Math.random().toString(36).substring(7) // Random password for OAuth users
          })
        }
        return true
      }

      return true
    },

    async jwt({ token, user, account }) {
      // Add role to token
      if (user) {
        token.role = (user as any).role || 'user'
        token.id = user.id
      }

      // For Google OAuth, get role from database
      if (account?.provider === 'google' && token.email) {
        const dbUser = AuthService.getAllUsers().find(u => u.email === token.email)
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
        }
      }

      return token
    },

    async session({ session, token }) {
      // Add role and id to session
      if (session.user) {
        (session.user as any).role = token.role
        (session.user as any).id = token.id
      }
      return session
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
