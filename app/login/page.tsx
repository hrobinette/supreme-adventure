import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar showNav={false} />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter the password to access the sales insights workspace.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
