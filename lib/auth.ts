import { db } from "@/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const dbUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        const newUser = await db.user.create({
          data: {
            email: user.email,
            name: user.name,
          },
        });

        // Initialize free subscription
        await db.subscription.create({
          data: {
            userId: newUser.id,
            plan: "FREE",
            credits: 3,
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // Redirect back to home for custom sign in if needed
  },
};
