import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            await User.create({
              name: user.name || "User",
              email: user.email || "",
              image: user.image || "",
            });
          } else {
            existingUser.lastActiveAt = new Date();
            await existingUser.save();
          }
          return true;
        } catch (error) {
          console.error("Error saving user during sign in", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            (session.user as any).id = dbUser._id.toString();
            (session.user as any).bio = dbUser.bio || "";
            (session.user as any).favorites = dbUser.favorites || [];
            (session.user as any).recentlyPlayed = dbUser.recentlyPlayed || [];
          }
        } catch (error) {
          console.error("Error fetching user data for session", error);
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
