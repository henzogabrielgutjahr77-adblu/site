"use client";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-navy-900 p-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Algo deu errado</h1>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 rounded bg-accent px-5 py-2 font-medium text-white hover:bg-orange-600"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
