import { ReactNode } from "react";
import { auth } from "@/auth";
import Header from "../components/Header";
import { LocaleProvider } from "../context/LocaleContext";
import I18nClientProvider from "../components/I18nClientProvider";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <LocaleProvider>
      <I18nClientProvider>
        <div className="flex flex-col min-h-screen bg-gray-100">
          <Header userName={session?.user?.name || "Guest"} />
          <main className="flex-1 container mx-auto px-6 py-6 bg-white my-6">
            {children}
          </main>
          <footer className="border-t bg-gray-50">
            <div className="container mx-auto text-center py-4 text-sm text-gray-500">
              © 2024 tentwenty. All rights reserved.
            </div>
          </footer>
        </div>
      </I18nClientProvider>
    </LocaleProvider>
  );
}
