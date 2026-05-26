import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import jsPDF from 'jspdf'

export default function OrdenProduccion() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const fecha = searchParams.get('fecha')
  const navigate = useNavigate()

  const fetchPedidos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (nombre),
        detalle_pedidos (
          cantidad,
          productos (nombre, unidad)
        )
      `)
      .eq('fecha_entrega', fecha)

    if (!error) setPedidos(data)
    setLoading(false)
  }

  useEffect(() => {
    if (fecha) fetchPedidos()
  }, [fecha])

  // Consolidar productos del día
  const consolidar = () => {
    const mapa = {}
    pedidos.forEach(pedido => {
      pedido.detalle_pedidos.forEach(detalle => {
        const nombre = detalle.productos?.nombre
        const unidad = detalle.productos?.unidad
        if (!mapa[nombre]) mapa[nombre] = { cantidad: 0, unidad }
        mapa[nombre].cantidad += parseFloat(detalle.cantidad)
      })
    })
    return Object.entries(mapa).map(([nombre, data]) => ({ nombre, ...data }))
  }

  const consolidado = consolidar()

  const fechaFormateada = fecha
    ? format(new Date(fecha + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })
    : ''

  const handleDescargarPDF = () => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.setTextColor(146, 64, 14)
    doc.text('ORDEN DE PRODUCCION', 105, 20, { align: 'center' })

    // Fecha
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`Fecha de entrega: ${fechaFormateada}`, 20, 35)
    doc.text(`Emitida el: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 20, 43)

    // Línea separadora
    doc.setDrawColor(146, 64, 14)
    doc.line(20, 48, 190, 48)

    // Consolidado
    doc.setFontSize(14)
    doc.setTextColor(146, 64, 14)
    doc.text('Resumen de Produccion', 20, 58)

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    consolidado.forEach((item, i) => {
      doc.text(`• ${item.nombre}: ${item.cantidad} ${item.unidad}`, 25, 68 + i * 10)
    })

    // Línea separadora
    const yDetalle = 68 + consolidado.length * 10 + 10
    doc.setDrawColor(200, 200, 200)
    doc.line(20, yDetalle, 190, yDetalle)

    // Detalle por cliente
    doc.setFontSize(14)
    doc.setTextColor(146, 64, 14)
    doc.text('Detalle por Cliente', 20, yDetalle + 10)

    let y = yDetalle + 20
    pedidos.forEach(pedido => {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'bold')
      doc.text(pedido.clientes?.nombre, 20, y)
      doc.setFont(undefined, 'normal')
      y += 7
      pedido.detalle_pedidos.forEach(detalle => {
        doc.text(`  - ${detalle.productos?.nombre}: ${detalle.cantidad} ${detalle.productos?.unidad}`, 20, y)
        y += 7
      })
      if (pedido.observaciones) {
        doc.setTextColor(120, 120, 120)
        doc.text(`  Obs: ${pedido.observaciones}`, 20, y)
        doc.setTextColor(0, 0, 0)
        y += 7
      }
      y += 3
    })

    doc.save(`orden-produccion-${fecha}.pdf`)
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-amber-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">📄 Orden de Producción</h1>
        <button
          onClick={() => navigate('/pedidos')}
          className="text-amber-200 hover:text-white text-sm"
        >
          ← Volver
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold text-amber-800 capitalize">{fechaFormateada}</h2>
                  <p className="text-sm text-gray-500">{pedidos.length} pedido(s) para este día</p>
                </div>
                <button
                  onClick={handleDescargarPDF}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  ⬇ Descargar PDF
                </button>
              </div>

              {/* Consolidado */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Resumen de Producción</h3>
                <div className="flex flex-col gap-2">
                  {consolidado.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-amber-50 rounded-lg px-4 py-2">
                      <span className="font-medium text-gray-800">{item.nombre}</span>
                      <span className="text-amber-700 font-bold">{item.cantidad} {item.unidad}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detalle por cliente */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2 border-b pb-1">Detalle por Cliente</h3>
                <div className="flex flex-col gap-3">
                  {pedidos.map(pedido => (
                    <div key={pedido.id} className="border border-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-gray-800 mb-1">{pedido.clientes?.nombre}</p>
                      {pedido.detalle_pedidos.map((detalle, i) => (
                        <p key={i} className="text-sm text-gray-600">
                          — {detalle.productos?.nombre}: <strong>{detalle.cantidad}</strong> {detalle.productos?.unidad}
                        </p>
                      ))}
                      {pedido.observaciones && (
                        <p className="text-xs text-gray-400 mt-1">📝 {pedido.observaciones}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}