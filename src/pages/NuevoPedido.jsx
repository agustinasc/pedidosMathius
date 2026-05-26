import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function NuevoPedido() {
  const [clientes, setClientes] = useState([])
  const [productos, setProductos] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [detalle, setDetalle] = useState([{ producto_id: '', cantidad: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

    const fetchData = async () => {
        const { data: clientesData } = await supabase.from('clientes').select('*').order('nombre')
        const { data: productosData } = await supabase.from('productos').select('*').order('nombre')
        setClientes(clientesData || [])
        setProductos(productosData || [])
    }

    useEffect(() => {
        fetchData()
    }, [])
  const agregarLinea = () => {
    setDetalle([...detalle, { producto_id: '', cantidad: '' }])
  }

  const eliminarLinea = (index) => {
    setDetalle(detalle.filter((_, i) => i !== index))
  }

  const actualizarLinea = (index, campo, valor) => {
    const nuevo = [...detalle]
    nuevo[index][campo] = valor
    setDetalle(nuevo)
  }

  const handleGuardar = async () => {
    setError('')

    if (!clienteId) return setError('Seleccioná un cliente')
    if (!fechaEntrega) return setError('Seleccioná una fecha de entrega')
    if (detalle.some(d => !d.producto_id || !d.cantidad)) return setError('Completá todos los productos y cantidades')

    setLoading(true)

    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .insert({ cliente_id: clienteId, fecha_entrega: fechaEntrega, observaciones })
      .select()
      .single()

    if (errorPedido) {
      setError('Error al guardar el pedido')
      setLoading(false)
      return
    }

    const detalleInsert = detalle.map(d => ({
      pedido_id: pedido.id,
      producto_id: d.producto_id,
      cantidad: parseFloat(d.cantidad)
    }))

    const { error: errorDetalle } = await supabase.from('detalle_pedidos').insert(detalleInsert)

    if (errorDetalle) {
      setError('Error al guardar el detalle del pedido')
      setLoading(false)
      return
    }

    navigate('/pedidos')
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-amber-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🥖 Nuevo Pedido</h1>
        <button
          onClick={() => navigate('/pedidos')}
          className="text-amber-200 hover:text-white text-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-5">

          {/* Cliente */}
          <div>
            <label className="text-sm font-medium text-gray-700">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Seleccioná un cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fecha de entrega */}
          <div>
            <label className="text-sm font-medium text-gray-700">Fecha de entrega</label>
            <input
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-sm font-medium text-gray-700">Observaciones <span className="text-gray-400">(opcional)</span></label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              rows={2}
              placeholder="Ej: entregar antes de las 8am"
            />
          </div>

          {/* Detalle de productos */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Productos</label>
            <div className="flex flex-col gap-2">
              {detalle.map((linea, index) => (

                <div key={index} className="flex flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <select
                      value={linea.producto_id}
                      onChange={(e) => actualizarLinea(index, 'producto_id', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Seleccioná producto...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} — {p.unidad}</option>
                      ))}
                    </select>
                    {detalle.length > 1 && (
                      <button
                        onClick={() => eliminarLinea(index)}
                        className="text-red-400 hover:text-red-600 text-2xl font-bold px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    value={linea.cantidad}
                    onChange={(e) => actualizarLinea(index, 'cantidad', e.target.value)}
                    placeholder="Cantidad"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    min="1"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={agregarLinea}
              className="mt-2 text-sm text-amber-600 hover:underline"
            >
              + Agregar otro producto
            </button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleGuardar}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Pedido'}
          </button>

        </div>
      </div>
    </div>
  )
}