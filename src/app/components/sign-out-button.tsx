"use client";

import { logout } from "@/lib/actions/auth";

export const SignOutButton = () => {
 return (<button onClick={() => logout()} className="border-2">
    Sign out of Github
  </button>)
};
