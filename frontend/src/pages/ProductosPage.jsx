import React, { useState, useEffect, useCallback } from 'react';
import productoService from '../services/productoService';
import ProductoForm from '../components/ProductoForm';
import ProductoTable from '../components/ProductoTable';

const FILTROS_CATEGORIA = [
  { id: 'TODAS', label: '🎨 Todas las Categorías', color: '#4f46e5' },
  { id: 1, label: '🧪 Pigmentos y Óleos', color: '#3730a3' },
  { id: 2, label: '🖼️ Lienzos y Soportes', color: '#b45309' },
  { id: 3, label: '🖌️ Pinceles y Espátulas', color: '#047857' },
  { id: 4, label: '📜 Papeles Técnicos', color: '#9d174d' }
];

const ProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');

  const cargarProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productoService.getProductos();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No fue posible cargar el catálogo de productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const handleAbrirNuevo = () => {
    setProductoAEditar(null);
    setError('');
    setMensajeExito('');
    setMostrarFormulario(true);
  };

  const handleEditar = (producto) => {
    setProductoAEditar(producto);
    setError('');
    setMensajeExito('');
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setProductoAEditar(null);
    setMostrarFormulario(false);
  };

  const handleGuardar = async (productoData) => {
    setError('');
    setMensajeExito('');
    try {
      if (productoAEditar && productoAEditar.id_producto) {
        await productoService.updateProducto(productoAEditar.id_producto, productoData);
        setMensajeExito('✨ Producto actualizado exitosamente en el catálogo.');
      } else {
        await productoService.createProducto(productoData);
        setMensajeExito('🎉 Nuevo producto registrado exitosamente en el catálogo.');
      }

      setProductoAEditar(null);
      setMostrarFormulario(false);
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar el producto.');
    }
  };

  const handleEliminar = async (idProducto) => {
    setError('');
    setMensajeExito('');
    try {
      await productoService.deleteProducto(idProducto);
      setMensajeExito('🗑️ Producto eliminado exitosamente del inventario.');
      if (productoAEditar && productoAEditar.id_producto === idProducto) {
        setProductoAEditar(null);
        setMostrarFormulario(false);
      }
      await cargarProductos();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al eliminar el producto.');
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria =
      categoriaFiltro === 'TODAS' || Number(p.id_categoria) === Number(categoriaFiltro);
    const termino = busqueda.trim().toLowerCase();
    const coincideTexto =
      !termino ||
      String(p.nombre || '').toLowerCase().includes(termino) ||
      String(p.codigo_sku || '').toLowerCase().includes(termino) ||
      String(p.marca_nombre || '').toLowerCase().includes(termino) ||
      String(p.categoria_nombre || '').toLowerCase().includes(termino);
    return coincideCategoria && coincideTexto;
  });

  const totalReferencias = productos.length;
  const valorPromedioVenta =
    totalReferencias > 0
      ? productos.reduce((acc, p) => acc + (Number(p.precio_venta) || 0), 0) / totalReferencias
      : 0;
  const margenPromedio =
    totalReferencias > 0
      ? Math.round(
          productos.reduce((acc, p) => {
            const c = Number(p.precio_compra) || 1;
            const v = Number(p.precio_venta) || 1;
            return acc + ((v - c) / c) * 100;
          }, 0) / totalReferencias
        )
      : 0;
  const totalUnidadesMinimas = productos.reduce((acc, p) => acc + (Number(p.stock_minimo) || 0), 0);

  return (
    <section className="productos-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Tarjetas de Resumen KPI Multicolor */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          marginBottom: '28px'
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            padding: '20px 22px',
            borderRadius: '16px',
            boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.35)'
          }}
        >
          <div style={{ fontSize: '0.82rem', opacity: 0.9, fontWeight: 600, textTransform: 'uppercase' }}>
            🎨 Referencias Activas
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 2px' }}>
            {totalReferencias} Productos
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Catálogo sincronizado con MySQL
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            padding: '20px 22px',
            borderRadius: '16px',
            boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.35)'
          }}
        >
          <div style={{ fontSize: '0.82rem', opacity: 0.9, fontWeight: 600, textTransform: 'uppercase' }}>
            💰 Ticket Promedio Venta
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 2px' }}>
            ${valorPromedioVenta.toFixed(2)} USD
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Precio mayorista sugerido
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
            color: '#ffffff',
            padding: '20px 22px',
            borderRadius: '16px',
            boxShadow: '0 10px 20px -5px rgba(236, 72, 153, 0.35)'
          }}
        >
          <div style={{ fontSize: '0.82rem', opacity: 0.9, fontWeight: 600, textTransform: 'uppercase' }}>
            📈 Margen Bruto Promedio
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 2px' }}>
            +{margenPromedio}%
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Rentabilidad sobre costo de compra
          </div>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            color: '#ffffff',
            padding: '20px 22px',
            borderRadius: '16px',
            boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.35)'
          }}
        >
          <div style={{ fontSize: '0.82rem', opacity: 0.9, fontWeight: 600, textTransform: 'uppercase' }}>
            📦 Reserva de Stock Mínimo
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, margin: '6px 0 2px' }}>
            {totalUnidadesMinimas} Unidades
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
            Umbral de reabastecimiento
          </div>
        </div>
      </div>

      {/* Encabezado de Sección y Botón de Acción */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 800, color: '#1e1b4b' }}>
            Catálogo Maestro de Productos
          </h2>
          <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.95rem' }}>
            Gestión integral de pigmentos, lienzos, pinceles y papeles técnicos
          </p>
        </div>

        <button
          type="button"
          onClick={() => (mostrarFormulario ? handleCancelar() : handleAbrirNuevo())}
          style={{
            background: mostrarFormulario
              ? 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '12px 22px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(79, 70, 229, 0.35)'
          }}
        >
          {mostrarFormulario ? '✕ Cerrar Formulario' : '＋ Nuevo Producto'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fef2f2',
            borderLeft: '5px solid #ef4444',
            color: '#991b1b',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontWeight: 600
          }}
        >
          <strong>Error: </strong> {error}
        </div>
      )}

      {mensajeExito && (
        <div
          role="status"
          style={{
            backgroundColor: '#ecfdf5',
            borderLeft: '5px solid #10b981',
            color: '#065f46',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontWeight: 600
          }}
        >
          {mensajeExito}
        </div>
      )}

      {/* Formulario Desplegable */}
      {mostrarFormulario && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #e0e7ff',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '26px',
            boxShadow: '0 12px 30px -8px rgba(79, 70, 229, 0.15)'
          }}
        >
          <ProductoForm
            productoActual={productoAEditar}
            onSubmit={handleGuardar}
            onCancelar={handleCancelar}
          />
        </div>
      )}

      {/* Barra de Búsqueda y Filtros por Categoría */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px 20px',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FILTROS_CATEGORIA.map((filtro) => {
            const activo = categoriaFiltro === filtro.id;
            return (
              <button
                key={filtro.id}
                type="button"
                onClick={() => setCategoriaFiltro(filtro.id)}
                style={{
                  backgroundColor: activo ? filtro.color : '#f1f5f9',
                  color: activo ? '#ffffff' : '#334155',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontSize: '0.83rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {filtro.label}
              </button>
            );
          })}
        </div>

        <div style={{ minWidth: '260px', flex: '1', maxWidth: '360px' }}>
          <input
            type="search"
            placeholder="🔍 Buscar por SKU, nombre o marca..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Tabla de Productos */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '6px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
          border: '1px solid #e2e8f0'
        }}
      >
        {loading ? (
          <p style={{ textAlign: 'center', padding: '36px', color: '#4f46e5', fontWeight: 600 }}>
            ⏳ Cargando inventario de productos...
          </p>
        ) : (
          <ProductoTable
            productos={productosFiltrados}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
          />
        )}
      </div>
    </section>
  );
};

export default ProductosPage;
