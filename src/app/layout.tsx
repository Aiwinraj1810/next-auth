// app/layout.tsx
"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

// ✅ Import Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // custom CSS variable
  display: "swap", // avoids FOUT (flash of unstyled text)
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <NuqsAdapter>{children}</NuqsAdapter>
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
