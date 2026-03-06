// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      status: string;
      statusExpiry?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        // ✅ ADMIN CHECK - .env'dan
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (
          credentials.email === ADMIN_EMAIL &&
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: "admin-id",
            email: ADMIN_EMAIL,
            name: "Admin",
            image: undefined,
            role: "admin",
            status: "vip",
          };
        }

        // Regular user check
        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await user.comparePassword(
          credentials.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Check expiry
        if (user.statusExpiry && new Date(user.statusExpiry) < new Date()) {
          user.status = "free";
          user.statusExpiry = null;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          status: user.status,
          statusExpiry: user.statusExpiry?.toISOString(),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              avatar: user.image,
              password: Math.random().toString(36).slice(-8),
              isVerified: true,
              role: "user",
              status: "free",
            });

            user.id = newUser._id.toString();
            (user as any).status = newUser.status;
          } else {
            if (
              existingUser.statusExpiry &&
              new Date(existingUser.statusExpiry) < new Date()
            ) {
              existingUser.status = "free";
              existingUser.statusExpiry = null;
              await existingUser.save();
            }

            user.id = existingUser._id.toString();
            (user as any).status = existingUser.status;
            (user as any).statusExpiry =
              existingUser.statusExpiry?.toISOString();
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.status = (user as any).status || "free";
        token.statusExpiry = (user as any).statusExpiry;
      }

      // Skip DB check for admin
      if (token.email === process.env.ADMIN_EMAIL) {
        return token;
      }

      // Check expiry for regular users
      if (token.id && !user && token.id !== "admin-id") {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            if (
              dbUser.statusExpiry &&
              new Date(dbUser.statusExpiry) < new Date()
            ) {
              dbUser.status = "free";
              dbUser.statusExpiry = null;
              await dbUser.save();
            }
            token.status = dbUser.status;
            token.statusExpiry = dbUser.statusExpiry?.toISOString();
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "user";
        session.user.status = (token.status as string) || "free";
        session.user.statusExpiry = token.statusExpiry as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // ✅ Admin -> /admin'ga redirect
      if (url.includes("role=admin") || url.includes("/admin")) {
        return `${baseUrl}/admin`;
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
