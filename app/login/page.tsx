import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar showNav={false} />
      <main className="mx-auto flex max-w-md flex-col px-4 py-20">
        <h1 className="text-2xl font-bold tracking-tight">
          Sign <span className="brand-text">in</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Enter the password to access the sales insights workspace.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
