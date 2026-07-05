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
          
          const generateReferralCode = (email: string) => {
            const prefix = (email || "US").substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, "X");
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomPart = '';
            for (let i = 0; i < 5; i++) {
              randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return `${prefix}${randomPart}XBUFF`;
          };

          if (!existingUser) {
            await User.create({
              name: user.name || "User",
              email: user.email || "",
              image: user.image || "",
              referralCode: generateReferralCode(user.email || ""),
            });
          } else {
            existingUser.lastActiveAt = new Date();
            if (!existingUser.referralCode) {
              existingUser.referralCode = generateReferralCode(user.email || "");
            }
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
            let referralCode = dbUser.referralCode;
            
            // Auto-generate if missing (for already logged-in users who never triggered signIn)
            if (!referralCode) {
              const prefix = (dbUser.email || "US").substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, "X");
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              let randomPart = '';
              for (let i = 0; i < 5; i++) {
                randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              referralCode = `${prefix}${randomPart}XBUFF`;
              dbUser.referralCode = referralCode;
              await dbUser.save();
            }

            (session.user as any).id = dbUser._id.toString();
            (session.user as any).bio = dbUser.bio || "";
            (session.user as any).favorites = dbUser.favorites || [];
            (session.user as any).recentlyPlayed = dbUser.recentlyPlayed || [];
            (session.user as any).xp = dbUser.xp || 0;
            (session.user as any).currentStreak = dbUser.currentStreak || 0;
            (session.user as any).referralCode = referralCode;
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
