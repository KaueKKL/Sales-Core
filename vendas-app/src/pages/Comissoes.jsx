import React from 'react';
import { usePedidos } from '../context/PedidosContext';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const Price = ({ value }) => (
  <span className="font-mono tracking-tight font-bold">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
  </span>
);

export default function Comissoes() {
  const { pedidos } = usePedidos();
  const { usuario } = useAuth();

  // Segurança
  if (usuario?.role === 'sub') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <AlertTriangle size={64} className="text-yellow-500 mb-4"/>
        <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
        <p>Assistentes não possuem acesso ao módulo financeiro.</p>
      </div>
    );
  }

  // Filtrar Pedidos Transmitidos
  const vendasConfirmadas = pedidos.filter(p => p.status === 'TRANSMITIDO');

  // Lógica de Projeção Mensal
  const projecaoMensal = {};

  vendasConfirmadas.forEach(pedido => {
    const qtdParcelas = pedido.pagamento?.parcelas || 1;
    // Se comissaoTotal não existir (pedidos antigos), calcula 5%
    const valorComissaoTotal = pedido.comissaoTotal || (pedido.total * 0.05); 
    const valorPorParcela = valorComissaoTotal / qtdParcelas;
    const dataVenda = new Date(pedido.data);

    for (let i = 1; i <= qtdParcelas; i++) {
      const dataParcela = new Date(dataVenda);
      dataParcela.setMonth(dataParcela.getMonth() + i);
      
      const chaveMes = dataParcela.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!projecaoMensal[chaveMes]) projecaoMensal[chaveMes] = 0;
      projecaoMensal[chaveMes] += valorPorParcela;
    }
  });

  const totalGeralComissao = vendasConfirmadas.reduce((acc, p) => acc + (p.comissaoTotal || p.total * 0.05), 0);

  return (
    <div className="p-6 md:p-10 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Comissões & Recebíveis</h1>
      <p className="text-gray-500 mb-8">Acompanhamento de performance financeira.</p>

      {/* Cards de Topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-2xl p-6 text-white shadow-lg">
           <div className="flex items-center gap-3 mb-2 opacity-80">
             <DollarSign size={20}/>
             <span className="text-sm font-bold uppercase">Total a Receber</span>
           </div>
           <div className="text-3xl font-bold mb-1"><Price value={totalGeralComissao}/></div>
           <p className="text-xs text-green-200">Refere-se a {vendasConfirmadas.length} vendas confirmadas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
           <div className="flex items-center gap-3 mb-2 text-blue-600">
             <Calendar size={20}/>
             <span className="text-sm font-bold uppercase">Próximo Mês</span>
           </div>
           {Object.keys(projecaoMensal).length > 0 ? (
             <>
               <div className="text-2xl font-bold text-gray-800">
                 <Price value={Object.values(projecaoMensal)[0]}/>
               </div>
               <p className="text-xs text-gray-400 mt-1 capitalize">{Object.keys(projecaoMensal)[0]}</p>
             </>
           ) : <p className="text-gray-400 text-sm py-2">Sem previsões futuras.</p>}
        </div>

      </div>

      {/* Tabela de Fluxo */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda (Tabela Meses) */}
        <div className="xl:col-span-1">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-600"/> Projeção de Recebimento
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {Object.keys(projecaoMensal).length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Nenhuma comissão parcelada.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="p-4">Mês</th>
                    <th className="p-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(projecaoMensal).map(([mes, valor], idx) => (
                    <tr key={idx}>
                      <td className="p-4 font-bold text-gray-700 capitalize flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-blue-500"></div> {mes}
                      </td>
                      <td className="p-4 text-right font-bold text-green-700">
                         <Price value={valor}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Coluna da Direita (Origem) */}
        <div className="xl:col-span-2">
           <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
             Origem das Comissões
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendasConfirmadas.map(pedido => (
                 <div key={pedido.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                           <p className="font-bold text-gray-800 text-sm">Pedido #{pedido.id.toString().slice(-4)}</p>
                           <p className="text-xs text-gray-500 truncate max-w-[150px]">{pedido.cliente?.nome}</p>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                          <Price value={pedido.comissaoTotal || pedido.total * 0.05}/>
                        </span>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-50 pt-2 mt-1">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          {pedido.pagamento?.label || 'Pagamento Padrão'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                           {new Date(pedido.data).toLocaleDateString()}
                        </span>
                    </div>
                 </div>
              ))}
              {vendasConfirmadas.length === 0 && (
                <div className="text-gray-400 text-sm col-span-2 text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                  Nenhuma venda confirmada.
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}