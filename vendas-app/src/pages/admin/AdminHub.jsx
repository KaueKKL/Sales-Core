// src/pages/admin/AdminHub.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Settings, Layers, ChevronRight, ArrowLeft } from 'lucide-react';

export default function AdminHub() {
  const { produtos } = useAdmin();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      
      {/* Header */}
      <div className="bg-gray-900 text-white p-6 pt-10">
        <div className="flex items-center gap-3 mb-4">
           <button onClick={() => navigate('/')} className="p-1 bg-white/10 rounded-full"><ArrowLeft size={20}/></button>
           <h1 className="text-2xl font-bold">Painel Admin</h1>
        </div>
        <p className="text-gray-400 text-sm">Configure produtos e variações.</p>
      </div>

      <div className="p-4 space-y-6 -mt-6">
        
        {/* Card Variações */}
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Layers className="text-purple-500" /> Variações Globais
            </h2>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">2 Ativas</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Gerencie tabelas de cores e tecidos padrão.</p>
          <button className="w-full py-2 border border-purple-200 text-purple-700 font-bold rounded-lg hover:bg-purple-50">
            Gerenciar
          </button>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <Settings className="text-blue-500" /> Produtos Disponíveis
          </h2>
          
          <div className="space-y-3">
            {produtos.map(prod => (
              <div 
                key={prod.id} 
                onClick={() => navigate(`/admin/produto/${prod.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all bg-gray-50"
              >
                <img src={prod.imagem} className="w-12 h-12 rounded bg-white object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-700 truncate">{prod.nome}</h3>
                  <p className="text-xs text-gray-400">{prod.skuBase}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold mb-1 ${prod.tipoPrecificacao === 'matriz' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {prod.tipoPrecificacao === 'matriz' ? 'MATRIZ' : 'SOMA'}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}