import React, { useState, useEffect } from 'react';

const ESTADO_INICIAL = {
  codigo_sku: '',
  nombre: '',
  descripcion: '',
  precio_compra: '',
  precio_venta: '',
  stock_minimo: 10,
  id_categoria: 1,
  id_marca: 1,
  id_unidad: 1
};

const CATEGORIAS = [
  { id: 1, nombre: '1 · Pigmentos y Óleos Profesionales' },
  { id: 2, nombre: '2 · Lienzos y Soportes Rígidos' },
  { id: 3, nombre: '3 · Pinceles y Espátulas Técnicas' },
  { id: 4, nombre: '4 · Papeles Técnicos y Acuarela' }
];

const MARCAS = [
  { id: 1, nombre: '1 · Winsor & Newton (Reino Unido)' },
  { id: 2, nombre: '2 · Fabriano (Italia)' },
  { id: 3, nombre: '3 · Escoda (España)' },
  { id: 4, nombre: '4 · Sennelier (Francia)' }
];

const UNIDADES = [
  { id: 1, nombre: '1 · Tubo de 37 Mililitros (TUB-37ML)' },
  { id: 2, nombre: '2 · Pliego 56x76 Centímetros (PLG-56X76)' },
  { id: 3, nombre: '3 · Caja Mayorista de 12 Unidades (CAJ-12U)' },
  { id: 4, nombre: '4 · Rollo de 10 Metros Lineales (ROL-10M)' }
];

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '6px',
  letterSpacing: '0.2px'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1.5px solid #cbd5e1',
  backgroundColor: '#f8fafc',
  fontSize: '0.92rem',
  color: '#0f172a',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};

const ProductoForm = ({ productoActual, onSubmit, onCancelar }) => {
  const [formData, setFormData] = useState(ESTADO_INICIAL);
  const [errorValidacion, setErrorValidacion] = useState('');

  useEffect(() => {
    if (productoActual) {
      setFormData({
        codigo_sku: productoActual.codigo_sku ?? '',
        nombre: productoActual.nombre ?? '',
        descripcion: productoActual.descripcion ?? '',
        precio_compra: productoActual.precio_compra ?? '',
        precio_venta: productoActual.precio_venta ?? '',
        stock_minimo: productoActual.stock_minimo ?? 0,
        id_categoria: productoActual.id_categoria ?? 1,
        id_marca: productoActual.id_marca ?? 1,
        id_unidad: productoActual.id_unidad ?? 1
      });
    } else {
      setFormData(ESTADO_INICIAL);
    }
    setErrorValidacion('');
  }, [productoActual]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorValidacion('');

    const skuLimpio = String(formData.codigo_sku).trim();
    const nombreLimpio = String(formData.nombre).trim();
    const descripcionLimpia = String(formData.descripcion || '').trim();
    const precioCompraNum = parseFloat(formData.precio_compra);
    const precioVentaNum = parseFloat(formData.precio_venta);
    const stockMinimoNum = Number(formData.stock_minimo);
    const idCategoriaNum = Number(formData.id_categoria);
    const idMarcaNum = Number(formData.id_marca);
    const idUnidadNum = Number(formData.id_unidad);

    if (!skuLimpio || !nombreLimpio) {
      setErrorValidacion('El SKU y el Nombre del producto son obligatorios.');
      return;
    }

    if (Number.isNaN(precioCompraNum) || precioCompraNum <= 0) {
      setErrorValidacion('El Precio de Compra debe ser un número mayor a 0.');
      return;
    }

    if (Number.isNaN(precioVentaNum) || precioVentaNum <= 0) {
      setErrorValidacion('El Precio de Venta debe ser un número mayor a 0.');
      return;
    }

    if (!Number.isInteger(stockMinimoNum) || stockMinimoNum < 0) {
      setErrorValidacion('El Stock Mínimo debe ser un número entero mayor o igual a 0.');
      return;
    }

    onSubmit({
      codigo_sku: skuLimpio,
      nombre: nombreLimpio,
      descripcion: descripcionLimpia,
      precio_compra: precioCompraNum,
      precio_venta: precioVentaNum,
      stock_minimo: stockMinimoNum,
      id_categoria: idCategoriaNum,
      id_marca: idMarcaNum,
      id_unidad: idUnidadNum
    });
  };

  const handleReset = () => {
    setFormData(ESTADO_INICIAL);
    setErrorValidacion('');
    if (onCancelar) {
      onCancelar();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="producto-form">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          marginBottom: '20px',
          borderBottom: '2px solid #f1f5f9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: productoActual
                ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
                : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 700
            }}
          >
            {productoActual ? '✏️' : '✨'}
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>
              {productoActual ? `Editar Producto: ${productoActual.codigo_sku}` : 'Registrar Nuevo Producto'}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Completa las especificaciones técnicas y comerciales del insumo artístico
            </span>
          </div>
        </div>
      </div>

      {errorValidacion && (
        <div
          role="alert"
          style={{
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            borderLeft: '4px solid #ef4444',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          ⚠️ {errorValidacion}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px'
        }}
      >
        <div>
          <label htmlFor="codigo_sku" style={labelStyle}>
            Código SKU *
          </label>
          <input
            id="codigo_sku"
            name="codigo_sku"
            type="text"
            placeholder="Ej. OLE-WN-001"
            value={formData.codigo_sku}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label htmlFor="nombre" style={labelStyle}>
            Nombre Comercial del Artículo *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ej. Óleo Profesional Azul Ultramar 37ml"
            value={formData.nombre}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="precio_compra" style={labelStyle}>
            Precio de Compra (USD) *
          </label>
          <input
            id="precio_compra"
            name="precio_compra"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.precio_compra}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="precio_venta" style={labelStyle}>
            Precio de Venta (USD) *
          </label>
          <input
            id="precio_venta"
            name="precio_venta"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.precio_venta}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="stock_minimo" style={labelStyle}>
            Stock Mínimo de Alerta *
          </label>
          <input
            id="stock_minimo"
            name="stock_minimo"
            type="number"
            step="1"
            min="0"
            value={formData.stock_minimo}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="id_categoria" style={labelStyle}>
            Categoría *
          </label>
          <select
            id="id_categoria"
            name="id_categoria"
            value={formData.id_categoria}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="id_marca" style={labelStyle}>
            Marca *
          </label>
          <select
            id="id_marca"
            name="id_marca"
            value={formData.id_marca}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            {MARCAS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="id_unidad" style={labelStyle}>
            Unidad de Medida *
          </label>
          <select
            id="id_unidad"
            name="id_unidad"
            value={formData.id_unidad}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            {UNIDADES.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label htmlFor="descripcion" style={labelStyle}>
          Descripción Técnica
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows="3"
          placeholder="Especificaciones de pigmentación, gramaje, composición o formato..."
          value={formData.descripcion}
          onChange={handleChange}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          type="submit"
          style={{
            background: productoActual
              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
              : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '11px 22px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
        >
          {productoActual ? '💾 Actualizar Producto' : '＋ Guardar Producto'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px solid #cbd5e1',
            padding: '11px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer'
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ProductoForm;
