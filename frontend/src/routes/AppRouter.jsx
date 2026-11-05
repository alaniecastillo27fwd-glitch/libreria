import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import RutaProtegida from "../components/RutaProtegida";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import ProductosPage from "../pages/ProductosPage";
import CategoriasPage from "../pages/CategoriasPage";
import ProveedoresPage from "../pages/ProveedoresPage";

const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Rutas públicas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas privadas protegidas por <RutaProtegida> */}
          <Route
            path="/"
            element={
              <RutaProtegida>
                <ProductosPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/libros"
            element={
              <RutaProtegida>
                <ProductosPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/productos"
            element={
              <RutaProtegida>
                <ProductosPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/generos"
            element={
              <RutaProtegida>
                <CategoriasPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/categorias"
            element={
              <RutaProtegida>
                <CategoriasPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/editoriales"
            element={
              <RutaProtegida>
                <ProveedoresPage />
              </RutaProtegida>
            }
          />
          <Route
            path="/proveedores"
            element={
              <RutaProtegida>
                <ProveedoresPage />
              </RutaProtegida>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/libros" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRouter;
