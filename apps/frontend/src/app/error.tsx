"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <div className="text-2xl font-bold">Algo deu errado</div>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {error.message ?? "Ocorreu um erro inesperado. Tente novamente."}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium"
      >
        Tentar novamente
      </button>
    </div>
  );
}
