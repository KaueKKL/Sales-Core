// src/components/BottomNav.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ClipboardList, Settings } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/catalogo', label: 'Produtos', icon: Package },
    { path: '/pedidos', label: 'Pedidos', icon: ClipboardList },
    { path: '/admin', label: 'Admin', icon: Settings }, // <--- Novo Item
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-40 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;