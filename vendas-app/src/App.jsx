import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { PedidosProvider } from './context/PedidosContext';

import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Pedidos from './pages/Pedidos';
import Comissoes from './pages/Comissoes';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import Carrinho from './pages/Carrinho';
import AdminDashboard from './pages/admin/AdminDashboard'; // NOVO
import AdminHub from './pages/admin/AdminHub'; // (Antigo AdminHub vira Engenharia/Config)
import EditorProduto from './pages/admin/EditorProduto';

const RotaProtegida = ({ children }) => {
  const { usuario } = useAuth();
  if (!usuario) return <Login />;
  return children;
};

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      {!usuario && <Route path="*" element={<Login />} />}

      <Route element={<RotaProtegida><MainLayout /></RotaProtegida>}>
        {/* ROTA HOME INTELIGENTE */}
        <Route path="/" element={
           usuario?.role === 'admin' ? <Navigate to="/admin-dashboard" /> :
           usuario?.role === 'sub' ? <Navigate to="/catalogo" /> : 
           <Home />
        } />
        
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/pedidos" element={<Pedidos />} />
        <Route path="/comissoes" element={usuario?.role === 'vendedor' ? <Comissoes /> : <Navigate to="/" />} />
        
        {/* Rotas Admin */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/config" element={<AdminHub />} />
      </Route>

      {/* Rotas Fullscreen */}
      <Route path="/produto/:id" element={<RotaProtegida><ProdutoDetalhe /></RotaProtegida>} />
      <Route path="/carrinho" element={<RotaProtegida><Carrinho /></RotaProtegida>} />
      <Route path="/admin/produto/:id" element={<RotaProtegida><EditorProduto /></RotaProtegida>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <PedidosProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </PedidosProvider>
      </AdminProvider>
    </AuthProvider>
  );
}