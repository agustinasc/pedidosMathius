import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../App'

export default function Configuracion() {
  const navigate = useNavigate()
  
  const perfil = useContext(UserContext)

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="bg-amber-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">⚙️ Configuración</h1>
        <button
          onClick={() => navigate('/pedidos')}
          className="text-amber-200 hover:text-white text-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        <button
          onClick={() => navigate('/clientes')}
          className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition border border-amber-100"
        >
          <h2 className="text-lg font-bold text-amber-800">👥 Clientes</h2>
          <p className="text-gray-500 text-sm mt-1">Agregar, editar y eliminar clientes</p>
        </button>

        <button
          onClick={() => navigate('/productos')}
          className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition border border-amber-100"
        >
          <h2 className="text-lg font-bold text-amber-800">🍞 Productos</h2>
          <p className="text-gray-500 text-sm mt-1">Agregar, editar y eliminar productos</p>
        </button>


        {/* -------- boton de usuarios ------- */}

        {perfil?.rol === 'admin' && (
          <button
            onClick={() => navigate('/usuarios')}
            className="bg-white rounded-2xl shadow-sm p-6 text-left hover:shadow-md transition border border-amber-100"
          >
            <h2 className="text-lg font-bold text-amber-800">👤 Usuarios</h2>
            <p className="text-gray-500 text-sm mt-1">Agregar y eliminar vendedores</p>
          </button>
        )}
      </div>
    </div>
  )
}