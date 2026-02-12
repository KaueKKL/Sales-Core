// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../context/PedidosContext';
import { 
  TrendingUp, ShoppingCart, Users, ChevronRight, 
  Package, DollarSign, Activity, Calendar
} from 'lucide-react';

const Price = ({ value }) => (
  <span className="font-bold">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
  </span>
);

export default function Home() {
  const navigate = useNavigate();
  const { pedidos } = usePedidos();

  // --- CÁLCULOS DE KPIS (Baseado nos dados do contexto) ---
  
  // 1. Vendas Totais (Só pedidos transmitidos contam para meta)
  const vendasTransmitidas = pedidos.filter(p => p.status === 'TRANSMITIDO');
  const totalVendido = vendasTransmitidas.reduce((acc, p) => acc + p.total, 0);
  
  // 2. Meta (Fictícia para demo)
  const metaMensal = 50000;
  const progresso = Math.min((totalVendido / metaMensal) * 100, 100);
  
  // 3. Pedidos em Aberto (Rascunhos + Erros)
  const pedidosPendentes = pedidos.filter(p => p.status === 'RASCUNHO' || p.status === 'ERRO').length;

  // 4. Ticket Médio
  const ticketMedio = vendasTransmitidas.length > 0 ? totalVendido / vendasTransmitidas.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER / SAUDAÇÃO */}
      <div className="bg-blue-900 text-white p-6 pb-12 rounded-b-[2rem] shadow-xl relative overflow-hidden">
        {/* Efeito de fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full -ml-10 -mb-5 blur-xl"></div>

        <div className="relative z-10 flex justify-between items-start mb-6">
           <div>
             <p className="text-blue-200 text-sm font-medium mb-1">Bem-vindo de volta,</p>
             <h1 className="text-2xl font-bold">Carlos Vendedor</h1>
           </div>
           <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
             <Users size={20} className="text-white"/>
           </div>
        </div>

        {/* CARD DE META (Flutuante) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white">
           <div className="flex justify-between items-end mb-2">
             <div>
               <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">Vendas do Mês</p>
               <p className="text-2xl font-bold mt-1"><Price value={totalVendido}/></p>
             </div>
             <div className="text-right">
               <p className="text-xs text-blue-200">Meta: <Price value={metaMensal}/></p>
               <p className="text-lg font-bold">{progresso.toFixed(0)}%</p>
             </div>
           </div>
           {/* Barra de Progresso */}
           <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out" 
               style={{ width: `${progresso}%` }}
             ></div>
           </div>
        </div>
      </div>

      <div className="p-4 -mt-6 relative z-20 space-y-6">

        {/* --- GRID DE KPIS --- */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card Pedidos */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28">
             <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-2">
               <Activity size={18}/>
             </div>
             <div>
               <p className="text-gray-400 text-xs font-bold uppercase">Pendentes</p>
               <p className="text-xl font-bold text-gray-800">{pedidosPendentes} <span className="text-xs font-normal text-gray-400">pedidos</span></p>
             </div>
          </div>

          {/* Card Ticket Médio */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-28">
             <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-2">
               <TrendingUp size={18}/>
             </div>
             <div>
               <p className="text-gray-400 text-xs font-bold uppercase">Ticket Médio</p>
               <p className="text-xl font-bold text-gray-800"><Price value={ticketMedio}/></p>
             </div>
          </div>
        </div>

        {/* --- MENU DE ACESSO RÁPIDO --- */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Acesso Rápido</h3>
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex justify-around">
            <BotaoRapido icon={Package} label="Catálogo" onClick={() => navigate('/catalogo')} color="text-purple-600 bg-purple-50" />
            <BotaoRapido icon={ShoppingCart} label="Novo Pedido" onClick={() => navigate('/catalogo')} color="text-blue-600 bg-blue-50" />
            <BotaoRapido icon={Calendar} label="Agenda" onClick={() => alert('Feature Futura')} color="text-pink-600 bg-pink-50" />
            <BotaoRapido icon={DollarSign} label="Tabela" onClick={() => alert('Abrir PDF Tabela')} color="text-green-600 bg-green-50" />
          </div>
        </div>

        {/* --- ÚLTIMAS ATIVIDADES --- */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 text-sm">Últimos Pedidos</h3>
            <button onClick={() => navigate('/pedidos')} className="text-blue-600 text-xs font-bold flex items-center">
              Ver Todos <ChevronRight size={14}/>
            </button>
          </div>
          
          <div className="space-y-3">
            {pedidos.slice(0, 3).map(pedido => (
              <div key={pedido.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                  pedido.status === 'TRANSMITIDO' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {pedido.status === 'TRANSMITIDO' ? 'OK' : '...'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    {pedido.cliente ? pedido.cliente.nome : 'Cliente Balcão'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {pedido.itens.length} itens • {new Date(pedido.data).toLocaleDateString()}
                  </p>
                </div>
                <div className="font-bold text-sm text-gray-800">
                  <Price value={pedido.total}/>
                </div>
              </div>
            ))}
             
            {pedidos.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-4">Nenhuma atividade recente.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Componente botão rápido
const BotaoRapido = ({ icon: Icon, label, onClick, color }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 p-2 active:scale-95 transition-transform">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={24}/>
    </div>
    <span className="text-xs font-medium text-gray-600">{label}</span>
  </button>
);