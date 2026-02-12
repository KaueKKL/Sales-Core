import React from 'react';
import { usePedidos } from '../../context/PedidosContext';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, Package, DollarSign, Settings, 
  BarChart3, Calendar, ArrowUpRight, Activity, 
  Wallet, ChevronRight, UserCircle
} from 'lucide-react';

const Price = ({ value }) => (
  <span className="font-bold font-mono tracking-tight">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
  </span>
);

export default function AdminDashboard() {
  const { pedidos } = usePedidos();
  const navigate = useNavigate();

  // --- 1. DADOS ---
  const pedidosReais = pedidos.filter(p => p.status === 'TRANSMITIDO');
  const totalReais = pedidosReais.reduce((acc, p) => acc + p.total, 0);
  const baseHistorica = 145000.00; 
  const faturamentoTotal = baseHistorica + totalReais;
  const comissoesPendentes = faturamentoTotal * 0.05;

  // --- 2. PROJEÇÃO (Simulada) ---
  const projecaoMensal = {};
  const meses = ['Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'];
  meses.forEach((mes, idx) => { projecaoMensal[mes] = 5000 - (idx * 500); });
  
  pedidosReais.forEach(p => {
    const comissao = p.comissaoTotal || p.total * 0.05;
    const parcelas = p.pagamento?.parcelas || 1;
    const valorParcela = comissao / parcelas;
    const dataVenda = new Date(p.data);
    for(let i = 0; i < parcelas; i++) {
       const dataParcela = new Date(dataVenda);
       dataParcela.setMonth(dataParcela.getMonth() + i + 1);
       const nomeMes = dataParcela.toLocaleDateString('pt-BR', { month: 'long' });
       const chave = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
       if (!projecaoMensal[chave]) projecaoMensal[chave] = 0;
       projecaoMensal[chave] += valorParcela;
    }
  });

  // --- 3. DADOS VENDEDORES ---
  const dadosVendedores = [
    { id: 1, nome: 'Carlos (Gerente)', totalBase: 45000, img: 'bg-blue-100 text-blue-600' },
    { id: 2, nome: 'Ana (Loja 01)', totalBase: 38200, img: 'bg-purple-100 text-purple-600' },
    { id: 3, nome: 'Roberto (Externo)', totalBase: 29500, img: 'bg-green-100 text-green-600' },
    { id: 4, nome: 'Ricardo (Junior)', totalBase: 12800, img: 'bg-orange-100 text-orange-600' },
  ];

  const tabelaVendedores = dadosVendedores.map(v => {
    const vendasReaisVendedor = pedidosReais
      .filter(p => p.vendedor?.id === v.id || (v.id === 1 && !p.vendedor))
      .reduce((acc, p) => acc + p.total, 0);
    const total = v.totalBase + vendasReaisVendedor;
    return { ...v, total, comissao: total * 0.05 };
  }).sort((a,b) => b.total - a.total);

  // --- 4. GRÁFICO DIÁRIO ---
  const dadosGrafico = [
    { dia: 'Seg', valor: 12000, altura: '40%' },
    { dia: 'Ter', valor: 18500, altura: '65%' },
    { dia: 'Qua', valor: 15200, altura: '50%' },
    { dia: 'Qui', valor: 22000, altura: '80%' },
    { dia: 'Sex', valor: 28000 + totalReais, altura: '95%' },
    { dia: 'Sáb', valor: 14000, altura: '45%' },
    { dia: 'Dom', valor: 8000,  altura: '20%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 pb-24 font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-blue-600"/> Dashboard Financeiro
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestão de Vendas e Comissionamento</p>
        </div>
        <div className="flex gap-3">
           <div className="bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
             <Calendar size={14}/> Fevereiro/2026
           </div>
           <button 
             onClick={() => navigate('/admin/config')} 
             className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 shadow-lg shadow-gray-900/20 text-sm font-bold transition-all"
           >
             <Settings size={16}/> Engenharia
           </button>
        </div>
      </div>

      {/* --- BLOCO 1: KPIs (Altura Unificada) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Faturamento Total', val: <Price value={faturamentoTotal}/>, badge: '+18%' },
          { icon: Wallet, color: 'text-white', bg: 'bg-white/20', label: 'Comissões (Mês)', val: <Price value={comissoesPendentes}/>, badge: 'Saída', dark: true },
          { icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Ticket Médio', val: <Price value={faturamentoTotal / (150 + pedidosReais.length)}/> },
          { icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Pedidos Fechados', val: 150 + pedidosReais.length }
        ].map((kpi, idx) => (
          <div key={idx} className={`p-5 rounded-2xl shadow-sm border flex flex-col justify-between h-32 transition-all hover:-translate-y-1 ${kpi.dark ? 'bg-gray-900 text-white border-gray-800' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
             <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}><kpi.icon size={20}/></div>
                {kpi.badge && <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">{kpi.badge}</span>}
             </div>
             <div>
               <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${kpi.dark ? 'text-gray-400' : 'text-gray-500'}`}>{kpi.label}</p>
               <h3 className="text-2xl font-bold leading-none">{kpi.val}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* --- BLOCO 2: GRÁFICO + TABELA (Altura Sincronizada) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-stretch">
        
        {/* ESQUERDA: Gráfico (2/3 da tela) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <BarChart3 size={20} className="text-blue-600"/> Vendas da Semana
             </h3>
           </div>
           
           {/* Área Flexível do Gráfico */}
           <div className="flex-1 flex items-end justify-between gap-3 min-h-[250px]">
              {dadosGrafico.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group relative">
                   {/* Tooltip */}
                   <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                     <Price value={item.valor}/>
                   </div>
                   {/* Barra */}
                   <div 
                     className={`w-full max-w-[40px] rounded-t-lg transition-all duration-700 ease-out relative ${idx === 4 ? 'bg-blue-600 shadow-lg shadow-blue-200' : 'bg-blue-100 hover:bg-blue-200'}`}
                     style={{ height: item.altura }}
                   ></div>
                   <span className={`text-xs font-bold ${idx === 4 ? 'text-blue-600' : 'text-gray-400'}`}>{item.dia}</span>
                </div>
              ))}
           </div>
        </div>

        {/* DIREITA: Lista de Pagamentos (1/3 da tela) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="p-5 border-b border-gray-100 bg-gray-50/50">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               <Calendar size={20} className="text-green-600"/> Pagamentos Futuros
             </h3>
             <p className="text-xs text-gray-500 mt-1">Fluxo de saída (Comissões)</p>
           </div>
           
           {/* Lista com Scroll e Flex-1 para ocupar espaço */}
           <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-gray-200">
             <table className="w-full text-sm text-left">
               <tbody className="divide-y divide-gray-100">
                 {Object.entries(projecaoMensal).slice(0, 12).map(([mes, valor], idx) => (
                   <tr key={idx} className="hover:bg-gray-50 transition-colors">
                     <td className="p-4 py-3 font-medium text-gray-600 flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full shrink-0 ${idx === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                       {mes}
                     </td>
                     <td className="p-4 py-3 text-right font-bold text-gray-800">
                       <Price value={valor}/>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="p-3 bg-gray-50 text-center border-t border-gray-100 text-[10px] text-gray-400">
             Baseado nos parcelamentos
           </div>
        </div>

      </div>

      {/* --- BLOCO 3: VENDEDORES --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-indigo-600"/> Equipe Comercial
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
              <tr>
                <th className="p-4">Colaborador</th>
                <th className="p-4 text-right">Vendas</th>
                <th className="p-4 text-right">Comissão (5%)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tabelaVendedores.map((v, idx) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${v.img}`}><UserCircle size={18}/></div>
                      <div>
                        <p className="font-bold text-gray-800">{v.nome}</p>
                        <p className="text-xs text-gray-400">#{v.id + 100}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-600"><Price value={v.total}/></td>
                  <td className="p-4 text-right font-bold text-green-700"><Price value={v.comissao}/></td>
                  <td className="p-4 text-center"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Ativo</span></td>
                  <td className="p-4 text-right text-gray-400"><ChevronRight size={16}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}