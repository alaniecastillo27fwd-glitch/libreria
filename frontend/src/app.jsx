import React, { useState, useEffect } from 'react';
import AppRouter from './routes/AppRouter';

// Paleta Oficial:
// Fresh Grown: #EFF4BD | Azeitona: #A2B447 | Fig Leaf: #556F30
// Moss Green:  #23361A | Wood Bark: #362F22 | Azul Petróleo: #516F7A

const App = () => {
  const [modoOscuro, setModoOscuro] = useState(() => {
    try {
      return localStorage.getItem('artsupply_tema') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('artsupply_tema', modoOscuro ? 'dark' : 'light');
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [modoOscuro]);

  return (
    <div
      className="app-layout"
      data-theme={modoOscuro ? 'dark' : 'light'}
      style={{
        minHeight: '100vh',
        background: modoOscuro
          ? 'linear-gradient(135deg, #23361A 0%, #362F22 55%, #23361A 100%)'
          : 'linear-gradient(135deg, #EFF4BD 0%, rgba(239, 244, 189, 0.55) 50%, rgba(81, 111, 122, 0.18) 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
        color: modoOscuro ? '#EFF4BD' : '#23361A',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Estilos dinámicos de Modo Claro / Oscuro y micro-animaciones con la paleta de 6 colores */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dropdownPop {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalPop {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes alertSlideIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .app-layout, .app-layout * {
          transition: background-color 0.22s ease, border-color 0.22s ease, color 0.18s ease, transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease;
        }

        /* Animación suave de entrada en paneles, tarjetas y alertas */
        .app-layout section,
        .app-layout .auth-card {
          animation: fadeSlideUp 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .app-layout section:nth-of-type(2) {
          animation-delay: 0.06s;
        }
        .app-layout [role="alert"],
        .app-layout [role="status"] {
          animation: alertSlideIn 0.26s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .app-layout [role="listbox"] {
          animation: dropdownPop 0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: top center;
        }
        .app-layout [role="dialog"] {
          animation: backdropFade 0.18s ease-out both;
        }
        .app-layout [role="dialog"] > div {
          animation: modalPop 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Micro-interacciones agradables en tarjetas de campos, inputs, botones y filas */
        .app-layout form > div > div:hover,
        .app-layout form > div > div:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -6px rgba(35, 54, 26, 0.16);
        }
        .app-layout input:focus,
        .app-layout textarea:focus,
        .app-layout .select-colorido-trigger:hover {
          box-shadow: 0 0 0 3px rgba(162, 180, 71, 0.32);
        }
        .app-layout button:not(:disabled):hover,
        .app-layout a:hover {
          transform: translateY(-1.5px);
        }
        .app-layout button:not(:disabled):active,
        .app-layout a:active {
          transform: translateY(0) scale(0.98);
        }
        .app-layout tbody tr:hover {
          background-color: rgba(239, 244, 189, 0.45) !important;
        }

        /* Reglas de Modo Oscuro */
        .app-layout[data-theme="dark"] section,
        .app-layout[data-theme="dark"] .auth-card {
          background: linear-gradient(145deg, #362F22 0%, #23361A 100%) !important;
          border-color: #556F30 !important;
          color: #EFF4BD !important;
          box-shadow: 0 14px 34px rgba(35, 54, 26, 0.55) !important;
        }
        .app-layout[data-theme="dark"] .select-colorido-trigger {
          background: #23361A !important;
          border-color: #A2B447 !important;
          color: #EFF4BD !important;
        }
        .app-layout[data-theme="dark"] .select-colorido-label {
          color: #EFF4BD !important;
        }
        .app-layout[data-theme="dark"] h1,
        .app-layout[data-theme="dark"] h2,
        .app-layout[data-theme="dark"] h3,
        .app-layout[data-theme="dark"] label,
        .app-layout[data-theme="dark"] th,
        .app-layout[data-theme="dark"] td {
          color: #EFF4BD !important;
        }
        .app-layout[data-theme="dark"] input,
        .app-layout[data-theme="dark"] textarea {
          background-color: #23361A !important;
          color: #EFF4BD !important;
          border-color: #A2B447 !important;
        }
        .app-layout[data-theme="dark"] input::placeholder,
        .app-layout[data-theme="dark"] textarea::placeholder {
          color: rgba(239, 244, 189, 0.55) !important;
        }
        .app-layout[data-theme="dark"] thead tr {
          background-color: #23361A !important;
          border-bottom: 2px solid #A2B447 !important;
        }
        .app-layout[data-theme="dark"] tbody tr {
          border-bottom: 1px solid rgba(162, 180, 71, 0.28) !important;
        }
        .app-layout[data-theme="dark"] tbody tr:hover {
          background-color: rgba(81, 111, 122, 0.24) !important;
        }
        .app-layout[data-theme="dark"] [role="listbox"] {
          background: #362F22 !important;
          border-color: #A2B447 !important;
          color: #EFF4BD !important;
        }
        .app-layout[data-theme="dark"] [role="option"] {
          color: #EFF4BD !important;
        }
        .app-layout[data-theme="dark"] [role="dialog"] > div {
          background: #362F22 !important;
          border-color: #A2B447 !important;
          color: #EFF4BD !important;
        }
        .app-layout[data-theme="dark"] form > div > div {
          background: rgba(35, 54, 26, 0.72) !important;
          border-color: #556F30 !important;
        }
      `}</style>

      {/* Barra superior con la paleta oficial */}
      <div
        style={{
          height: '6px',
          background: 'linear-gradient(90deg, #23361A 0%, #556F30 25%, #A2B447 50%, #516F7A 75%, #362F22 100%)'
        }}
      />

      <header
        style={{
          background: modoOscuro
            ? 'linear-gradient(120deg, #362F22 0%, #23361A 55%, #516F7A 100%)'
            : 'linear-gradient(120deg, #23361A 0%, #556F30 52%, #516F7A 100%)',
          color: '#EFF4BD',
          padding: '20px 28px',
          borderBottom: modoOscuro ? '1.5px solid #556F30' : 'none',
          boxShadow: '0 10px 25px -5px rgba(35, 54, 26, 0.35)'
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
                background: 'linear-gradient(135deg, #A2B447 0%, #556F30 60%, #516F7A 100%)',
                border: '1.5px solid #EFF4BD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: '#EFF4BD',
                boxShadow: '0 4px 12px rgba(35, 54, 26, 0.4)'
              }}
            >
              LB
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.3px', color: '#EFF4BD' }}>
                  Librería Editorial
                </h1>
                <span
                  style={{
                    background: '#A2B447',
                    color: '#23361A',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px'
                  }}
                >
                  MySQL · Librería
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#EFF4BD', opacity: 0.9 }}>
                Sistema de Gestión de Libros · Control de Autores, Géneros Literarios, Editoriales y Stock
              </p>
            </div>
          </div>

          {/* Interruptor de Modo Claro / Modo Oscuro */}
          <button
            type="button"
            onClick={() => setModoOscuro((prev) => !prev)}
            aria-label={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1.5px solid #A2B447',
              background: modoOscuro ? '#23361A' : '#EFF4BD',
              color: modoOscuro ? '#EFF4BD' : '#23361A',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(35, 54, 26, 0.28)'
            }}
          >
            <span>{modoOscuro ? 'Modo Oscuro' : 'Modo Claro'}</span>
            <span
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '999px',
                background: modoOscuro ? '#556F30' : '#362F22',
                padding: '2px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: modoOscuro ? 'flex-end' : 'flex-start',
                border: '1px solid #A2B447'
              }}
            >
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#EFF4BD',
                  display: 'block'
                }}
              />
            </span>
          </button>
        </div>
      </header>

      <main style={{ paddingBottom: '60px' }}>
        <AppRouter />
      </main>
    </div>
  );
};

export default App;
