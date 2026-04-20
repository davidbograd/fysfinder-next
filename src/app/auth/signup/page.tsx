import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Opret konto
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Få flere patienter i din fysioterapeutklinik
          </p>
          <ol className="mt-5 flex items-start justify-center gap-3 text-left" aria-label="Tilmeldingsforløb">
            <li className="flex min-w-0 flex-col items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                1
              </span>
              <span className="text-xs font-medium text-gray-900 sm:text-sm">
                Opret konto
              </span>
            </li>
            <li className="mt-4 h-0.5 w-12 rounded-full bg-primary/30 sm:w-16" aria-hidden="true" />
            <li className="flex min-w-0 flex-col items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm font-semibold text-gray-500">
                2
              </span>
              <span className="text-xs font-medium text-gray-500 sm:text-sm">
                Tilføj din klinik
              </span>
            </li>
          </ol>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}

