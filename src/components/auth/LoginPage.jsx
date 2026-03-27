import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
        setSignUpSuccess(true)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (signUpSuccess) {
    return (
      <div className="min-h-screen topo-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-cerrado-500 via-amazonia-500 via-30% via-atlantica-500 via-50% via-caatinga-500 via-70% via-pantanal-500 via-85% to-pampa-500" />
            <div className="p-8 text-center">
              <span className="text-5xl block mb-4">📬</span>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Verifique seu e-mail</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enviamos um link de confirmação para <strong>{email}</strong>.
                Clique no link para ativar sua conta.
              </p>
              <button
                onClick={() => { setSignUpSuccess(false); setIsSignUp(false) }}
                className="text-amazonia-600 hover:text-amazonia-700 font-semibold text-sm"
              >
                Voltar para login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen topo-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Biome gradient bar */}
          <div className="h-1.5 bg-gradient-to-r from-cerrado-500 via-amazonia-500 via-30% via-atlantica-500 via-50% via-caatinga-500 via-70% via-pantanal-500 via-85% to-pampa-500" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-5xl block mb-3">🌿</span>
              <h1 className="text-2xl font-extrabold text-gray-800">Daily Shenanigans</h1>
              <p className="text-xs text-gray-400 mt-1">
                Registro diário de pesquisa geoespacial
              </p>
            </div>

            <h2 className="text-lg font-bold text-gray-700 mb-6 text-center">
              {isSignUp ? 'Criar conta' : 'Entrar'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amazonia-300 focus:border-amazonia-400 transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amazonia-300 focus:border-amazonia-400 transition-all"
                  placeholder={isSignUp ? 'Mínimo 6 caracteres' : '••••••••'}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-amazonia-500 to-amazonia-700 text-white font-semibold rounded-xl hover:from-amazonia-600 hover:to-amazonia-800 transition-all disabled:opacity-50 text-sm"
              >
                {loading
                  ? (isSignUp ? 'Criando...' : 'Entrando...')
                  : (isSignUp ? 'Criar conta' : 'Entrar')
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                className="text-sm text-gray-500 hover:text-amazonia-600 transition-colors"
              >
                {isSignUp
                  ? 'Já tem conta? Entrar'
                  : 'Não tem conta? Criar conta'
                }
              </button>
            </div>
          </div>

          {/* Footer biomes */}
          <div className="px-8 pb-6 pt-2 text-center">
            <div className="flex justify-center gap-2 text-lg">
              <span title="Cerrado">🔥</span>
              <span title="Amazônia">🌿</span>
              <span title="Mata Atlântica">💻</span>
              <span title="Caatinga">🌵</span>
              <span title="Pantanal">🏆</span>
              <span title="Pampa">📊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
