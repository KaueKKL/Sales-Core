import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Users, ShieldCheck, BarChart3 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        
        {/* Decorativo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4 text-blue-600">
             <ShieldCheck size={32}/>
           </div>
           <h1 className="text-3xl font-bold text-gray-800 mb-1">Bem-vindo</h1>
           <p className="text-gray-500 text-sm">Sistema Integrado de Vendas</p>
        </div>

        <div className="space-y-3">
          
          {/* Opção 1: VENDEDOR */}
          <button 
            onClick={() => login('vendedor')}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
          >
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
               <User size={20}/>
            </div>
            <div>
               <p className="font-bold text-gray-800 text-sm">Vendedor / Gerente</p>
               <p className="text-xs text-gray-500">Vendas, Comissões e Metas</p>
            </div>
          </button>

          {/* Opção 2: ASSISTENTE */}
          <button 
            onClick={() => login('sub')}
            className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
          >
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
               <Users size={20}/>
            </div>
            <div>
               <p className="font-bold text-gray-800 text-sm">Assistente Comercial</p>
               <p className="text-xs text-gray-500">Lançamento de Pedidos</p>
            </div>
          </button>

          {/* Opção 3: DIRETORIA (ADMIN) */}
          <button 
            onClick={() => login('admin')}
            className="w-full flex items-center gap-4 p-4 border border-gray-800 rounded-xl hover:bg-gray-900 hover:text-white transition-all group text-left"
          >
            <div className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center group-hover:bg-gray-700 group-hover:text-white transition-colors">
               <BarChart3 size={20}/>
            </div>
            <div>
               <p className="font-bold text-gray-800 group-hover:text-white text-sm">Diretoria</p>
               <p className="text-xs text-gray-500 group-hover:text-gray-300">BI, Engenharia e Gestão</p>
            </div>
          </button>

        </div>
        
        <p className="text-center text-xs text-gray-300 mt-8">Versão Demo 3.0</p>
      </div>
    </div>
  );
}