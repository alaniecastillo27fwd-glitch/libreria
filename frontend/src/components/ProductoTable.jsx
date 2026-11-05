import React from 'react';

const COLORES_CATEGORIA = {
  1: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc', icon: '🎨' },
  2: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '🖼️' },
  3: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7', icon: '🖌️' },
  4: { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4', icon: '📜' }
};

const COLORES_MARCA = {
  1: { bg: '#ede9fe', text: '#5b21b6' },
  2: { bg: '#e0f2fe', text: '#075985' },
  3: { bg: '#ffedd5', text: '#9a3412' },
  4: { bg: '#fae8ff', text: '#86198f' }
};

const ProductoTable = ({ productos = [], onEditar, onEliminar }) => {
  const handleConfirmarEliminacion = (idProducto) => {
    const confirmado = window.confirm(
      '¿Está seguro de que desea eliminar este producto del inventario?'
    );
    if (confirmado) {
      onEliminar(idProducto);
    }
  };

  if (productos.length === 0) {
    return (
      <div
        className="producto-table-empty"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: '#64748b',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
        <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
          No hay productos registrados en el catálogo
        </p>
      </div>
    );
  }

  return (
    <div className="producto-table-container" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', textAlign: 'left' }}>
        <thead>
          <tr
            style={{
              background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
              color: '#ffffff'
            }}
          >
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px', borderTopLeftRadius: '12px' }}>
              SKU
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Producto y Especificación
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Categoría
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Marca
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              P. Compra
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              P. Venta / Margen
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center' }}>
              Stock Mín.
            </th>
            <th style={{ padding: '14px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', borderTopRightRadius: '12px' }}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, idx) => {
            const catStyle = COLORES_CATEGORIA[producto.id_categoria] || COLORES_CATEGORIA[1];
            const marcaStyle = COLORES_MARCA[producto.id_marca] || COLORES_MARCA[1];
            const compra = Number(producto.precio_compra) || 0;
            const venta = Number(producto.precio_venta) || 0;
            const margen = compra > 0 ? Math.round(((venta - compra) / compra) * 100) : 0;

            return (
              <tr
                key={producto.id_producto || producto.codigo_sku}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  transition: 'background-color 0.15s'
                }}
              >
                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      backgroundColor: '#0f172a',
                      color: '#38bdf8',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    {producto.codigo_sku}
                  </span>
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', maxWidth: '300px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                    {producto.nombre}
                  </div>
                  {producto.descripcion && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        marginTop: '3px',
                        lineHeight: 1.35
                      }}
                    >
                      {producto.descripcion}
                    </div>
                  )}
                  <div style={{ marginTop: '6px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: '999px'
                      }}
                    >
                      📦 Formato: {producto.unidad_abreviatura || `Unidad #${producto.id_unidad}`}
                    </span>
                  </div>
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: catStyle.bg,
                      color: catStyle.text,
                      border: `1px solid ${catStyle.border}`,
                      padding: '5px 11px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}
                  >
                    <span>{catStyle.icon}</span>
                    {producto.categoria_nombre || `Categoría ${producto.id_categoria}`}
                  </span>
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: marcaStyle.bg,
                      color: marcaStyle.text,
                      padding: '5px 11px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    {producto.marca_nombre || `Marca ${producto.id_marca}`}
                  </span>
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>
                  ${compra.toFixed(2)}
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                    ${venta.toFixed(2)}
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '2px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#047857',
                      backgroundColor: '#d1fae5',
                      padding: '1px 7px',
                      borderRadius: '999px'
                    }}
                  >
                    +{margen}% margen
                  </span>
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      backgroundColor: producto.stock_minimo <= 10 ? '#fef3c7' : '#e0f2fe',
                      color: producto.stock_minimo <= 10 ? '#b45309' : '#0369a1'
                    }}
                  >
                    {producto.stock_minimo} u.
                  </span>
                </td>

                <td style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => onEditar(producto)}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '7px 13px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirmarEliminacion(producto.id_producto)}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #e11d48 100%)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '7px 13px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.3)'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductoTable;
