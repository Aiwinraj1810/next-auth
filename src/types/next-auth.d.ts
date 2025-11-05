// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    jwt?: string; // 👈 Add the Strapi token here
  }

  interface JWT {
    jwt?: string;
  }
}
