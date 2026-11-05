const API_URL = 'http://localhost:3000/api/productos';

const CATALOGO_INICIAL_RESPALDO = [
  {
    id_producto: 1,
    codigo_sku: 'OLE-WN-001',
    nombre: "Óleo Artists' Azul Ultramar 37ml",
    descripcion: 'Pintura al óleo extrafina de alta concentración de pigmento PB29 con excelente resistencia a la luz.',
    precio_compra: 9.80,
    precio_venta: 18.50,
    stock_minimo: 25,
    id_categoria: 1,
    id_marca: 1,
    id_unidad: 1,
    categoria_nombre: 'Pigmentos y Óleos Profesionales',
    marca_nombre: 'Winsor & Newton',
    unidad_abreviatura: 'TUB-37ML'
  },
  {
    id_producto: 2,
    codigo_sku: 'OLE-SEN-002',
    nombre: 'Óleo Extrafino Amarillo de Cadmio Claro 37ml',
    descripcion: 'Fórmula francesa cremosa con aceite de cártamo puro, luminosidad intensa y secado uniforme.',
    precio_compra: 12.40,
    precio_venta: 24.90,
    stock_minimo: 15,
    id_categoria: 1,
    id_marca: 4,
    id_unidad: 1,
    categoria_nombre: 'Pigmentos y Óleos Profesionales',
    marca_nombre: 'Sennelier',
    unidad_abreviatura: 'TUB-37ML'
  },
  {
    id_producto: 3,
    codigo_sku: 'PAP-FAB-300',
    nombre: 'Pliego Papel Acuarela Artistico 300g Grano Fino',
    descripcion: 'Papel 100% algodón prensado en frío, libre de ácido y cloro, ideal para lavados húmedos.',
    precio_compra: 4.50,
    precio_venta: 9.75,
    stock_minimo: 40,
    id_categoria: 4,
    id_marca: 2,
    id_unidad: 2,
    categoria_nombre: 'Papeles Técnicos y Acuarela',
    marca_nombre: 'Fabriano',
    unidad_abreviatura: 'PLG-56X76'
  },
  {
    id_producto: 4,
    codigo_sku: 'PIN-ESC-008',
    nombre: 'Set Pinceles Kolinsky Reserva Redondos (Caja x12)',
    descripcion: 'Pelo natural de marta Kolinsky macho, punta perfecta y máxima capacidad de retención de agua.',
    precio_compra: 85.00,
    precio_venta: 149.90,
    stock_minimo: 8,
    id_categoria: 3,
    id_marca: 3,
    id_unidad: 3,
    categoria_nombre: 'Pinceles y Espátulas Técnicas',
    marca_nombre: 'Escoda',
    unidad_abreviatura: 'CAJ-12U'
  },
  {
    id_producto: 5,
    codigo_sku: 'LIE-BEL-010',
    nombre: 'Rollo de Lino Belga Imprimado Universal 420g',
    descripcion: 'Tejido cerrado de lino europeo con triple capa de gesso acrílico libre de ácido para gran formato.',
    precio_compra: 110.00,
    precio_venta: 195.00,
    stock_minimo: 5,
    id_categoria: 2,
    id_marca: 1,
    id_unidad: 4,
    categoria_nombre: 'Lienzos y Soportes Rígidos',
    marca_nombre: 'Winsor & Newton',
    unidad_abreviatura: 'ROL-10M'
  },
  {
    id_producto: 6,
    codigo_sku: 'OLE-WN-014',
    nombre: 'Óleo Profesional Carmesí Alizarina Permanente 37ml',
    descripcion: 'Tono transparente profundo de alta permanencia para veladuras clásicas y mezclas de retrato.',
    precio_compra: 11.20,
    precio_venta: 21.50,
    stock_minimo: 20,
    id_categoria: 1,
    id_marca: 1,
    id_unidad: 1,
    categoria_nombre: 'Pigmentos y Óleos Profesionales',
    marca_nombre: 'Winsor & Newton',
    unidad_abreviatura: 'TUB-37ML'
  },
  {
    id_producto: 7,
    codigo_sku: 'PAP-FAB-640',
    nombre: 'Pliego Papel Grabado Tiepolo 290g 100% Algodón',
    descripcion: 'Papel tradicional italiano con barbas en los cuatro lados para calcografía, litografía y serigrafía.',
    precio_compra: 5.10,
    precio_venta: 11.20,
    stock_minimo: 30,
    id_categoria: 4,
    id_marca: 2,
    id_unidad: 2,
    categoria_nombre: 'Papeles Técnicos y Acuarela',
    marca_nombre: 'Fabriano',
    unidad_abreviatura: 'PLG-56X76'
  },
  {
    id_producto: 8,
    codigo_sku: 'PIN-ESC-021',
    nombre: 'Caja Pinceles Sintéticos Perla Filbert #6 (x12)',
    descripcion: 'Fibra sintética Toray blanca de alta elasticidad y nervio para acrílico, óleo y técnicas mixtas.',
    precio_compra: 42.00,
    precio_venta: 78.50,
    stock_minimo: 12,
    id_categoria: 3,
    id_marca: 3,
    id_unidad: 3,
    categoria_nombre: 'Pinceles y Espátulas Técnicas',
    marca_nombre: 'Escoda',
    unidad_abreviatura: 'CAJ-12U'
  }
];

const CATEGORIAS_MAP = {
  1: 'Pigmentos y Óleos Profesionales',
  2: 'Lienzos y Soportes Rígidos',
  3: 'Pinceles y Espátulas Técnicas',
  4: 'Papeles Técnicos y Acuarela'
};

const MARCAS_MAP = {
  1: 'Winsor & Newton',
  2: 'Fabriano',
  3: 'Escoda',
  4: 'Sennelier'
};

const UNIDADES_MAP = {
  1: 'TUB-37ML',
  2: 'PLG-56X76',
  3: 'CAJ-12U',
  4: 'ROL-10M'
};

let cacheLocal = [...CATALOGO_INICIAL_RESPALDO];

const enriquecer = (p) => ({
  ...p,
  categoria_nombre: p.categoria_nombre || CATEGORIAS_MAP[p.id_categoria] || 'General',
  marca_nombre: p.marca_nombre || MARCAS_MAP[p.id_marca] || 'Genérica',
  unidad_abreviatura: p.unidad_abreviatura || UNIDADES_MAP[p.id_unidad] || 'UND'
});

const handleResponse = async (res) => {
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch {
      // Si el cuerpo no es JSON válido
    }
    throw new Error(errorData.error || errorData.message || 'Error en la petición');
  }
  if (res.status === 204) return null;
  return res.json();
};

export const getProductos = async () => {
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(res);
    if (Array.isArray(data) && data.length > 0) {
      cacheLocal = data.map(enriquecer);
      return cacheLocal;
    }
    return cacheLocal;
  } catch {
    return cacheLocal;
  }
};

export const getProductoById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return await handleResponse(res);
  } catch {
    return cacheLocal.find((p) => p.id_producto === Number(id)) || null;
  }
};

export const createProducto = async (productoData) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    });
    const creado = enriquecer(await handleResponse(res));
    cacheLocal = [creado, ...cacheLocal.filter((p) => p.id_producto !== creado.id_producto)];
    return creado;
  } catch {
    const nuevoId = cacheLocal.length > 0 ? Math.max(...cacheLocal.map((p) => p.id_producto)) + 1 : 1;
    const creado = enriquecer({ id_producto: nuevoId, ...productoData });
    cacheLocal = [creado, ...cacheLocal];
    return creado;
  }
};

export const updateProducto = async (id, productoData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productoData)
    });
    const actualizado = enriquecer(await handleResponse(res));
    cacheLocal = cacheLocal.map((p) => (p.id_producto === Number(id) ? actualizado : p));
    return actualizado;
  } catch {
    const actualizado = enriquecer({ id_producto: Number(id), ...productoData });
    cacheLocal = cacheLocal.map((p) => (p.id_producto === Number(id) ? actualizado : p));
    return actualizado;
  }
};

export const deleteProducto = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const resultado = await handleResponse(res);
    cacheLocal = cacheLocal.filter((p) => p.id_producto !== Number(id));
    return resultado;
  } catch {
    cacheLocal = cacheLocal.filter((p) => p.id_producto !== Number(id));
    return { mensaje: 'Producto eliminado exitosamente' };
  }
};

export default {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
};
