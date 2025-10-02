// app/page.tsx (server component)
import { auth } from "@/auth"
import SignInForm from "./components/sign-in-form"
import { SignOutButton } from "./components/sign-out-button"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth()

  if (session?.user) {
    // ✅ Redirect server-side if logged in
    redirect("/dashboard")
  }

  return (
    <div>
      <SignInForm />
    </div>
  )
}
