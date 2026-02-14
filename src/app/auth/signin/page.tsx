import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Log ind
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Log ind på din konto for at få adgang til dit dashboard
          </p>
        </div>
        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}

