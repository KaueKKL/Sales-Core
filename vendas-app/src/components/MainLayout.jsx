import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Package, ClipboardList, Settings, DollarSign, 
  LogOut, UserCircle, Cloud, BarChart3 
} from 'lucide-react';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  // Definição de Menu baseado em Roles
  const itensMenu = [
    // Dashboard: Vendedor vê Home, Admin vê AdminDashboard
    ...(usuario?.role === 'vendedor' ? [{ path: '/', label: 'Dashboard', icon: Home }] : []),
    ...(usuario?.role === 'admin' ? [{ path: '/admin-dashboard', label: 'Visão Geral', icon: BarChart3 }] : []),

    // Itens Comuns
    { path: '/catalogo', label: 'Catálogo', icon: Package },
    { path: '/pedidos', label: 'Pedidos', icon: ClipboardList },

    // Comissões (Só Vendedor)
    ...(usuario?.role === 'vendedor' ? [{ path: '/comissoes', label: 'Comissões', icon: DollarSign }] : []),
    
    // Configurações (Só Admin)
    ...(usuario?.role === 'admin' ? [{ path: '/admin/config', label: 'Engenharia', icon: Settings }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* === DESKTOP SIDEBAR === */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0 z-50">
        <div className="p-6 border-b border-gray-100">
           <div className="flex justify-between items-start">
             <h1 className="font-bold text-2xl text-blue-900 tracking-tight mb-4">Estofados<span className="text-blue-600">Pro</span></h1>
             {/* Indicador Tech Flex (Nuvem) */}
             <div className="flex items-center gap-1.5 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 cursor-help" title="Conectado ao ERP">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Online
             </div>
           </div>

           <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
             <div className="bg-white p-1.5 rounded-full text-blue-600 shadow-sm"><UserCircle size={24}/></div>
             <div className="flex-1 overflow-hidden">
               <p className="font-bold text-gray-800 text-sm truncate">{usuario?.nome}</p>
               <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                 {usuario?.role === 'sub' ? 'Assistente' : usuario?.role === 'admin' ? 'Diretoria' : 'Gerente'}
               </p>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {itensMenu.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                isActive(item.path) 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-[10px] text-gray-400 text-center mb-4 flex items-center justify-center gap-1">
             <Cloud size={10}/> Última sincronização: Agora
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm">
            <LogOut size={20}/> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* === ÁREA PRINCIPAL === */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        <div className="h-full w-full mx-auto">
           <Outlet />
        </div>
      </main>

      {/* === MOBILE BOTTOM NAV === */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {itensMenu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                active ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} className="transition-transform active:scale-90" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}