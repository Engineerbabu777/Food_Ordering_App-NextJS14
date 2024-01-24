import GoogleProvider from 'next-auth/providers/google'
import NextAuth from 'next-auth/next'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import clientPromise from '@/lib/mongoDB'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserInfo } from '@/models/UserInfo'
import { User } from '@/models/User.model'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth/next'

export const authOptions = {
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: async ({ token, session }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }

      return session
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'credentials',
      id: 'credentials',

      async authorize (credentials) {
        const email = credentials?.email

        await mongoose.connect(process.env.MONGODB_URI)
        const user = await User.findOne({ email })

        // EMAIL NOT EXISTS!
        if (!user) {
          throw new Error('Email is not registered')
        }

        // VERIFYING PASSWORD!
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        )
        // PASSWORD INCORRECT
        if (!isPasswordCorrect) {
          throw new Error('Incorect Password')
        }

        console.log({ user })

        return { happy: 'appy' }
      }
    })
  ]
}

export async function isAdmin () {
  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email
  if (!userEmail) {
    return false
  }
  const userInfo = await UserInfo.findOne({ email: userEmail })
  if (!userInfo) {
    return false
  }
  return userInfo.admin
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
