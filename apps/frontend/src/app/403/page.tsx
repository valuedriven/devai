import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <h1 className="text-6xl font-bold text-gray-900">403</h1>
      <h2 className="text-2xl font-semibold text-gray-700">Acesso Negado</h2>
      <p className="text-gray-500 text-center max-w-md">
        Você não tem permissão para acessar esta página.
        Se você acredita que isso é um erro, entre em contato com o suporte.
      </p>
      <Link
        href="/"
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voltar ao Início
      </Link>
    </div>
  )
}
