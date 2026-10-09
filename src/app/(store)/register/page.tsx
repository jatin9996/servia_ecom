import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="page py-14">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
