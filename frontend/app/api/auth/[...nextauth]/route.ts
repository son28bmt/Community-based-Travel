import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/auth/login", {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    const user = await res.json();

                    if (res.ok && user.token) {
                        return {
                            id: user.user._id || user.user.id,
                            name: user.user.name,
                            username: user.user.username,
                            email: user.user.email,
                            role: user.user.role || 'user',
                            avatar: user.user.avatar,
                            token: user.token,
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Auth Error", e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                try {
                    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000") + "/api/auth/google", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            picture: user.image,
                            googleId: account.providerAccountId,
                        }),
                    });

                    if (res.ok) {
                        const data = await res.json();
                        // Attach backend token to user object so it can be used in jwt callback
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const u = user as any;
                        u.token = data.token;
                        u.role = data.user.role;
                        u.id = data.user._id;
                        u.avatar = data.user.avatar;
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error("Google Signin Error to Backend:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = (user as any).token; // This will perform for both Google and Credentials
                token.name = user.name;
                token.username = (user as any).username;
                token.picture = (user as any).avatar || user.image;
            }
            if (trigger === "update" && session?.user) {
                if (session.user.name) token.name = session.user.name;
                if (session.user.image) token.picture = session.user.image;
                if ((session.user as any).username) token.username = (session.user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).accessToken = token.accessToken as string;
                session.user.name = token.name as string;
                (session.user as any).username = token.username as string;
                session.user.image = token.picture as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123",
});

export { handler as GET, handler as POST };
