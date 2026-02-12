import React, { useState } from 'react';
import { usePedidos } from '../context/PedidosContext';
import { useNavigate } from 'react-router-dom';
import { Send, Trash2, CheckCircle, Clock, AlertCircle, Edit2, ChevronDown, ChevronUp, FileText, Printer, Share2, X, MessageCircle, Copy } from 'lucide-react';

const Price = ({ value }) => (
  <span className="font-bold whitespace-nowrap">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
  </span>
);

export default function Pedidos() {
  const { pedidos, transmitirPedido, removerPedido, editarRascunho, adicionarAoCarrinho, limparCarrinho } = usePedidos();
  const navigate = useNavigate();
  const [expandidos, setExpandidos] = useState({});
  const [pedidoParaImpressao, setPedidoParaImpressao] = useState(null);

  const toggleExpand = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));

  const handleEditar = (id) => {
    if(confirm("Editar pedido? Ele voltará para o carrinho.")) {
        editarRascunho(id);
        navigate('/carrinho');
    }
  };

  const handleDuplicar = (pedidoAntigo) => {
    if (confirm('Limpar carrinho e duplicar este pedido?')) {
      limparCarrinho();
      pedidoAntigo.itens.forEach(item => {
        // OBS: Adiciona o item base, mas as observações específicas não são copiadas para forçar revisão
        adicionarAoCarrinho(item.produto, item.variacoes, item.preco);
      });
      navigate('/carrinho');
    }
  };

  const enviarWhatsApp = (pedido) => {
    const quebra = '%0a';
    let texto = `*PEDIDO #${pedido.id.toString().slice(-4)}*${quebra}`;
    texto += `Cliente: ${pedido.cliente?.nome}${quebra}`;
    texto += `Data: ${new Date(pedido.data).toLocaleDateString()}${quebra}${quebra}`;
    
    texto += `*ITENS:*${quebra}`;
    pedido.itens.forEach(item => {
      texto += `- ${item.quantidade}x ${item.produto.nome}${quebra}`;
      texto += `  (${Object.values(item.variacoes).join('/')})${quebra}`;
      if(item.obs) texto += `  _Obs: ${item.obs}_${quebra}`;
    });
    
    if(pedido.observacao) texto += `${quebra}*OBS GERAL:* ${pedido.observacao}${quebra}`;
    
    texto += `${quebra}*TOTAL: R$ ${pedido.total.toFixed(2).replace('.', ',')}*`;
    
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  const listaOrdenada = [...pedidos].sort((a, b) => {
    if (a.status === 'RASCUNHO' && b.status !== 'RASCUNHO') return -1;
    if (a.status !== 'RASCUNHO' && b.status === 'RASCUNHO') return 1;
    return b.id - a.id;
  });

  return (
    <div className="p-4 pb-24 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Meus Pedidos</h2>
      
      {listaOrdenada.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100"><p className="text-gray-500">Nenhum pedido gerado.</p></div>
      ) : (
        <div className="space-y-4">
          {listaOrdenada.map((pedido) => (
            <div key={pedido.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${pedido.status === 'TRANSMITIDO' ? 'border-green-200' : 'border-gray-200'}`}>
              
              {/* Header do Card */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">#{pedido.id.toString().slice(-4)}</h3>
                      <StatusBadge status={pedido.status} />
                   </div>
                   <p className="text-xs font-bold text-blue-800 mt-1 flex items-center gap-1"><FileText size={10}/> {pedido.cliente ? pedido.cliente.nome : 'Cliente não informado'}</p>
                   <p className="text-[10px] text-gray-400 mt-1">{new Date(pedido.data).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-gray-900"><Price value={pedido.total} /></div>
                    <div className="text-xs text-gray-500">{pedido.itens.length} itens</div>
                </div>
              </div>

              {/* Botão Expandir */}
              <button onClick={() => toggleExpand(pedido.id)} className="w-full py-2 px-4 flex items-center justify-center gap-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                {expandidos[pedido.id] ? 'Ocultar Detalhes' : 'Ver Detalhes'} 
                {expandidos[pedido.id] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>

              {/* Detalhes Expandidos */}
              {expandidos[pedido.id] && (
                  <div className="bg-gray-50 p-4 space-y-3 border-t border-gray-100 text-sm">
                      {pedido.observacao && (
                        <div className="bg-yellow-50 p-2 border border-yellow-100 rounded text-xs text-yellow-800 mb-2">
                           <strong>Obs:</strong> {pedido.observacao}
                        </div>
                      )}
                      
                      {pedido.itens.map(item => (
                          <div key={item.idItem} className="border-b border-gray-200 pb-2 last:border-0">
                              <div className="flex justify-between">
                                  <div className="pr-4">
                                      <span className="font-medium text-gray-700 block leading-tight">{item.produto.nome}</span>
                                      <div className="text-[10px] text-gray-500 mt-1">{Object.values(item.variacoes).join(' / ')}</div>
                                  </div>
                                  <span className="font-medium text-gray-600 whitespace-nowrap"><Price value={item.preco * item.quantidade} /></span>
                              </div>
                              {item.obs && <p className="text-[10px] text-gray-500 italic mt-1 bg-white inline-block px-1 rounded border border-gray-100">Obs: {item.obs}</p>}
                          </div>
                      ))}

                      {/* Resumo Financeiro */}
                      <div className="pt-2 flex justify-end text-xs text-gray-500">
                         <div className="text-right">
                           {pedido.desconto > 0 && <p>Subtotal: <Price value={pedido.subtotal || (pedido.total + pedido.desconto)}/></p>}
                           {pedido.desconto > 0 && <p className="text-red-500 font-bold">Desconto: - <Price value={pedido.desconto}/></p>}
                           <p className="font-bold text-gray-900 text-sm mt-1">Total: <Price value={pedido.total}/></p>
                         </div>
                      </div>
                  </div>
              )}

              {/* Ações */}
              <div className="p-3 bg-white flex gap-2 justify-end border-t border-gray-100 flex-wrap">
                <button onClick={() => enviarWhatsApp(pedido)} className="mr-auto text-green-600 hover:bg-green-50 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded transition-colors"><MessageCircle size={18}/> Zap</button>
                {pedido.status === 'TRANSMITIDO' && <button onClick={() => handleDuplicar(pedido)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded hover:bg-blue-50"><Copy size={16}/> Repetir</button>}
                <button onClick={() => setPedidoParaImpressao(pedido)} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded hover:bg-blue-50"><Printer size={16}/> DAV</button>

                {(pedido.status === 'RASCUNHO' || pedido.status === 'ERRO') ? (
                    <>
                      <button onClick={() => removerPedido(pedido.id)} className="p-2 text-red-500 bg-red-50 rounded-lg"><Trash2 size={20}/></button>
                      <button onClick={() => handleEditar(pedido.id)} className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-2 rounded-lg font-bold text-xs"><Edit2 size={16} /> Editar</button>
                      <button onClick={() => transmitirPedido(pedido.id)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xs"><Send size={16} /> Enviar</button>
                    </>
                ) : (
                    <div className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded text-xs font-mono font-bold"><CheckCircle size={14}/> {pedido.retornoErp?.sku_legado_gerado || 'OK'}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- DAV RESPONSIVO COM OBSERVAÇÕES E DESCONTO --- */}
      {pedidoParaImpressao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-lg shadow-2xl relative flex flex-col">
              
              <div className="sticky top-0 bg-gray-900 text-white p-3 flex justify-between items-center z-10 print:hidden">
                 <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base"><FileText size={18}/> DAV - Visualização</h3>
                 <button onClick={() => setPedidoParaImpressao(null)} className="hover:bg-white/20 p-1.5 rounded"><X size={20}/></button>
              </div>

              <div className="p-4 sm:p-8 bg-white text-gray-800 font-serif text-xs sm:text-sm print:p-0">
                 
                 <div className="text-center border-b-2 border-gray-800 pb-4 mb-4 sm:mb-6">
                    <h1 className="text-lg sm:text-2xl font-bold uppercase tracking-widest">Estofados Premium</h1>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">CNPJ: 00.000.000/0001-99 • Jaraguá do Sul/SC</p>
                 </div>

                 <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded sm:bg-transparent sm:p-0">
                       <p className="font-bold text-gray-500 text-[10px] uppercase">Cliente</p>
                       <p className="font-bold text-base sm:text-lg leading-tight">{pedidoParaImpressao.cliente?.nome || 'Consumidor'}</p>
                       <p>{pedidoParaImpressao.cliente?.cidade}</p>
                       <p className="font-mono text-xs">{pedidoParaImpressao.cliente?.cnpj}</p>
                    </div>
                    <div className="sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end bg-gray-50 p-3 rounded sm:bg-transparent sm:p-0">
                       <div><p className="font-bold text-gray-500 text-[10px] uppercase">Nº Pedido</p><p className="font-bold text-lg sm:text-xl text-red-600">#{pedidoParaImpressao.id.toString().slice(-6)}</p></div>
                       <div className="text-right">
                         <p className="text-gray-500 text-xs">{new Date(pedidoParaImpressao.data).toLocaleDateString()}</p>
                         <div className="mt-1 inline-block bg-gray-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{pedidoParaImpressao.status}</div>
                       </div>
                    </div>
                 </div>

                 {pedidoParaImpressao.observacao && (
                   <div className="mb-4 p-2 border border-dashed border-gray-300 bg-gray-50 rounded text-xs italic">
                     <strong>Observações Gerais:</strong> {pedidoParaImpressao.observacao}
                   </div>
                 )}

                 <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                    <table className="w-full mb-6 border-collapse min-w-[300px]">
                        <thead>
                          <tr className="border-b-2 border-gray-800 text-[10px] sm:text-xs uppercase bg-gray-50 sm:bg-transparent">
                              <th className="text-left py-2 px-2 sm:px-0">Item</th>
                              <th className="text-center py-2 px-1">Qtd</th>
                              <th className="text-right py-2 px-1">Unit</th>
                              <th className="text-right py-2 px-2 sm:px-0">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pedidoParaImpressao.itens.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-200 text-xs sm:text-sm">
                                <td className="py-2 sm:py-3 pr-2">
                                    <p className="font-bold line-clamp-2">{item.produto.nome}</p>
                                    <p className="text-[10px] text-gray-500 italic mt-0.5">{Object.values(item.variacoes).join(' - ')}</p>
                                    {item.obs && <p className="text-[10px] font-bold text-gray-600 mt-1">Obs: {item.obs}</p>}
                                </td>
                                <td className="text-center py-2 align-top">{item.quantidade}</td>
                                <td className="text-right py-2 align-top text-gray-600"><Price value={item.preco}/></td>
                                <td className="text-right py-2 align-top font-bold"><Price value={item.preco * item.quantidade}/></td>
                              </tr>
                          ))}
                        </tbody>
                    </table>
                 </div>

                 <div className="flex flex-col sm:items-end mb-8">
                    <div className="w-full sm:w-1/2 text-right space-y-1 bg-gray-50 p-3 rounded sm:bg-transparent sm:p-0">
                       <div className="flex justify-between text-gray-500 text-xs"><span>Subtotal:</span><span><Price value={pedidoParaImpressao.subtotal || (pedidoParaImpressao.total + (pedidoParaImpressao.desconto || 0))}/></span></div>
                       {pedidoParaImpressao.desconto > 0 && (
                         <div className="flex justify-between text-red-500 text-xs"><span>Desconto:</span><span>- <Price value={pedidoParaImpressao.desconto}/></span></div>
                       )}
                       <div className="flex justify-between font-bold text-lg sm:text-xl border-t border-gray-800 pt-2 mt-2">
                          <span>TOTAL:</span><span className="text-blue-900"><Price value={pedidoParaImpressao.total}/></span>
                       </div>
                       <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{pedidoParaImpressao.pagamento?.label}</p>
                    </div>
                 </div>

                 <div className="text-[10px] text-gray-400 text-center border-t border-gray-200 pt-4 mt-4">
                    <p className="mb-1">DAV - Documento Auxiliar de Venda (Sem valor fiscal).</p>
                    <p>Validade: 5 dias. Jaraguá do Sul, {new Date().toLocaleDateString()}.</p>
                 </div>
              </div>

              <div className="bg-gray-50 p-3 border-t border-gray-200 sticky bottom-0 flex gap-3 print:hidden">
                 <button onClick={() => window.print()} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-black flex justify-center items-center gap-2 text-sm"><Printer size={18}/> IMPRIMIR</button>
                 <button className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 text-sm"><Share2 size={18}/> PDF</button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const config = {
    'RASCUNHO': { icon: Clock, color: 'text-gray-500 bg-gray-200', text: 'Rascunho' },
    'TRANSMITINDO': { icon: Send, color: 'text-blue-500 bg-blue-100', text: 'Enviando' },
    'TRANSMITIDO': { icon: CheckCircle, color: 'text-green-600 bg-green-100', text: 'Enviado' },
    'ERRO': { icon: AlertCircle, color: 'text-red-500 bg-red-100', text: 'Erro' },
  };
  const { icon: Icon, color, text } = config[status] || config['RASCUNHO'];
  return <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${color}`}><Icon size={10} /> {text}</span>;
};