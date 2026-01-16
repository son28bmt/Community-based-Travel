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
                            username: user.user.username,
                            email: user.user.email,
                            role: user.user.role || 'user', // Default to user if undefined
                            avatar: user.user.avatar, // Pass avatar for initial mapping
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = user.token;
                token.name = user.name;
                token.username = user.username; // Map username
                token.picture = user.avatar;
            }
            if (trigger === "update" && session?.user) {
                if (session.user.name) token.name = session.user.name;
                if (session.user.image) token.picture = session.user.image;
                if (session.user.username) token.username = session.user.username; // Update username
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.accessToken = token.accessToken as string;
                session.user.name = token.name as string;
                session.user.username = token.username as string; // Pass to session
                session.user.image = token.picture as string;
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
