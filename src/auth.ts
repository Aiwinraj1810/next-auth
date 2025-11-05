import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * ✅ NextAuth configuration using:
 *  - GitHub OAuth login
 *  - Strapi local credentials authentication
 */

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    // 🔹 GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),

    // 🔹 Strapi Credentials Provider
    CredentialsProvider({
      id: "credentials",
      name: "Strapi Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Call Strapi’s local auth endpoint
          const res = await fetch(`${process.env.STRAPI_URL}/api/auth/local`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data?.error?.message || "Invalid credentials");
          }

          // Strapi returns: { jwt, user: {...} }
          const { jwt, user } = data;

          return {
            id: user.id,
            name: user.username,
            email: user.email,
            jwt, // keep the JWT to reuse in API calls
          };
        } catch (err) {
          throw new Error("Unable to connect to authentication server");
        }
      },
    }),
  ],

  // 🔹 Callbacks to inject JWT into session
  callbacks: {
    async jwt({ token, user }) {
      // Attach JWT when user logs in
      if (user?.jwt) {
        token.jwt = user.jwt;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Make Strapi JWT available in session
      if (token?.jwt) {
        session.jwt = token.jwt;
        session.user.id = token.id;
      }
      return session;
    },
  },



  secret: process.env.NEXTAUTH_SECRET,
});
