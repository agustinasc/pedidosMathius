import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Usuario o contraseña incorrectos')
    } else {
      navigate('/pedidos')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-amber-700 text-center mb-2">🥖 Panadería</h1>
        <p className="text-center text-gray-500 mb-6">Sistema de Pedidos</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="panaderia@panaderia.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}