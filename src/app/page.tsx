// app/page.tsx (server component)
"use server";

import { auth } from "@/auth";
import SignInForm from "./components/sign-in-form";
import { SignOutButton } from "./components/sign-out-button";


export default async function Page() {
  const session = await auth();

  if (session?.user) {
    return (
      <div>
        <p>Welcome {session.user.name || session.user.email}</p>
        <SignOutButton />
      </div>
    );
  }

  return (
    <div>
      <SignInForm />
    </div>
  );
}
