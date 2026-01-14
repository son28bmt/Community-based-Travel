import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch("http://localhost:5000/api/auth/login", {
                        method: "POST",
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" },
                    });

                    const user = await res.json();

                    if (res.ok && user.token) {
                        // Map backend response to NextAuth User object
                        return {
                            id: user.user._id || user.user.id,
                            name: user.user.name,
                            email: user.user.email,
                            role: user.user.role || 'user', // Default to user if undefined
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey123", // Should be in .env
});

export { handler as GET, handler as POST };
