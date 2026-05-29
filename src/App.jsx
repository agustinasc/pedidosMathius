import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './pages/Login'
import Pedidos from './pages/Pedidos'
import NuevoPedido from './pages/NuevoPedido'
import OrdenProduccion from './pages/OrdenProduccion'
import EditarPedido from './pages/EditarPedido'
import Configuracion from './pages/Configuracion'
import Clientes from './pages/Clientes'
import Productos from './pages/Productos'
import Usuarios from './pages/Usuarios'

export const UserContext = React.createContext(null)

function ProtectedRoute({ children, soloAdmin = false }) {
  const [session, setSession] = useState(undefined)
  const [perfil, setPerfil] = useState(undefined)

  useEffect(() => {
    const cargarSesionYPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (session) {
        const { data } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setPerfil(data || null)
      } else {
        setPerfil(null)
      }
    }

    cargarSesionYPerfil()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const { data } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setPerfil(data || null)
      } else {
        setPerfil(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined || perfil === undefined) {
    return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-amber-700">Cargando...</div>
  }

  if (!session) return <Navigate to="/" />
  if (soloAdmin && perfil?.rol !== 'admin') return <Navigate to="/pedidos" />

  return (
    <UserContext.Provider value={perfil}>
      {children}
    </UserContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/pedidos" element={<ProtectedRoute><Pedidos /></ProtectedRoute>} />
        <Route path="/nuevo-pedido" element={<ProtectedRoute><NuevoPedido /></ProtectedRoute>} />
        <Route path="/editar-pedido/:id" element={<ProtectedRoute><EditarPedido /></ProtectedRoute>} />
        <Route path="/orden-produccion" element={<ProtectedRoute><OrdenProduccion /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/productos" element={<ProtectedRoute soloAdmin><Productos /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute soloAdmin><Usuarios /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App