import NextAuth from "next-auth"
import Google from "next-auth/providers/google"



export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("=== Google Sign In Data ===")
      console.log("User:", user)
      console.log("Account:", account)
      console.log("Profile:", profile)
      console.log("========================")
      return true
    },
    async session({ session, token }) {
      console.log("=== Session Data ===")
      console.log("Session:", session)
      console.log("Token:", token)
      console.log("==================")
      return session
    }
  },
  secret: process.env.AUTH_SECRET,
})