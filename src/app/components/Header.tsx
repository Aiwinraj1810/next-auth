"use client";

import LanguageToggle from "./LanguageToggle";
import UserMenu from "../(protected)/user-menu";

export default function Header({ userName }: { userName: string }) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <h1 className="text-xl font-bold">ticktock</h1>
        <div className="flex items-center gap-4">
          <LanguageToggle  />
          <UserMenu userName={userName || "Guest"} />
        </div>
      </div>
    </header>
  );
}
