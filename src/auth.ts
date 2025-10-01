// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

const dummyUsers = [
  {
    id: "1",
    name: "Demo User",
    email: "username@example.com",
    // store plain text here only for demo/interview. Never in prod.
    password: "password123",
  },
  // Add more dummy users if you want
];

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      // The credentials object is used to generate a simple form in some adapters,
      // but you can build your own form on the client.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "username@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;

        const user = dummyUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          // return a user object - will be set on session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }

        // If you return null or false, authentication failed
        return null;
      },
    }),
  ],

  // optional: callbacks to shape the session jwt, etc.
  callbacks: {
    async session({ session, token }) {
      // session.user.id = token.sub; // example
      return session;
    },
  },

  // other NextAuth options...
});
