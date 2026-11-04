import React from 'react';
import AppRouter from './routes/AppRouter';

const App = () => {
  return (
    <div
      className="app-layout"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf2f8 50%, #f0fdf4 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#1e293b'
      }}
    >
      {/* Barra superior artística multicolor */}
      <div
        style={{
          height: '6px',
          background: 'linear-gradient(90deg, #4f46e5 0%, #ec4899 25%, #f59e0b 50%, #10b981 75%, #06b6d4 100%)'
        }}
      />

      <header
        style={{
          background: 'linear-gradient(120deg, #1e1b4b 0%, #312e81 45%, #4c1d95 100%)',
          color: '#ffffff',
          padding: '20px 28px',
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.35)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 50%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.4)'
              }}
            >
              🎨
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.3px' }}>
                  ArtSupply Pro
                </h1>
                <span
                  style={{
                    background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px'
                  }}
                >
                  Enterprise ERP
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#c7d2fe' }}>
                Distribuidora Mayorista de Bellas Artes · Control de Catálogo e Inventario Multi-Almacén
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#6ee7b7',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />
              MySQL 8.0 · 10 Entidades Activas
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#f8fafc'
              }}
            >
              Módulo CRUD · Inventario Central
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingBottom: '60px' }}>
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
