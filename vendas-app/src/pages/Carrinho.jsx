import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePedidos } from '../context/PedidosContext';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, ShoppingBag, ArrowRight, Minus, Plus, X, ChevronLeft, 
  User, Search, CreditCard, Tag, MessageSquare, AlertTriangle, Lock, Unlock 
} from 'lucide-react';

const Price = ({ value }) => (
  <span className="font-bold text-gray-900">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
  </span>
);

export default function Carrinho() {
  const { 
    carrinho, removerDoCarrinho, atualizarQuantidade, atualizarObsItem, limparCarrinho, 
    calcularSubtotal, calcularTotalFinal, descontoGlobal, setDescontoGlobal, fecharPedido 
  } = usePedidos();

  const { produtos, clientes, formasPagamento } = useAdmin();
  const { usuario } = useAuth(); // Pega o usuário logado para assinar o pedido
  const navigate = useNavigate();

  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('');
  const [obsGeral, setObsGeral] = useState('');

  // --- LÓGICA DE DESCONTO E TRAVA ---
  const [tipoDesconto, setTipoDesconto] = useState('R$');
  const [valorInputDesconto, setValorInputDesconto] = useState('');
  
  // Estados da Trava de Gerente
  const [bloqueioDesconto, setBloqueioDesconto] = useState(false);
  const [senhaGerente, setSenhaGerente] = useState('');
  const [descontoPendente, setDescontoPendente] = useState(0);

  useEffect(() => {
    if (descontoGlobal > 0 && valorInputDesconto === '') {
      setValorInputDesconto(descontoGlobal);
      setTipoDesconto('R$');
    }
  }, [descontoGlobal]);

  const handleInputDesconto = (valor, tipo) => {
    setValorInputDesconto(valor);
    const subtotal = calcularSubtotal();
    const num = parseFloat(valor) || 0;

    let descontoReal = 0;
    let percentualCalculado = 0;

    if (tipo === '%') {
      percentualCalculado = num;
      const porcentagemReal = Math.min(num, 100);
      descontoReal = subtotal * (porcentagemReal / 100);
    } else {
      descontoReal = Math.min(num, subtotal);
      percentualCalculado = subtotal > 0 ? (num / subtotal) * 100 : 0;
    }

    // TRAVA: Se passar de 10%, bloqueia
    if (percentualCalculado > 10) {
      setBloqueioDesconto(true);
      setDescontoPendente(descontoReal);
      setDescontoGlobal(0); // Zera até liberar
    } else {
      setBloqueioDesconto(false);
      setSenhaGerente('');
      setDescontoGlobal(descontoReal);
    }
  };

  const validarSenhaGerente = () => {
    if (senhaGerente === 'admin') { // Senha fixa para demo
      setBloqueioDesconto(false);
      setDescontoGlobal(descontoPendente);
      alert("Desconto autorizado com sucesso!");
    } else {
      alert("Senha incorreta!");
    }
  };

  const alternarTipoDesconto = (novoTipo) => {
    setTipoDesconto(novoTipo);
    setValorInputDesconto(''); 
    setDescontoGlobal(0);
    setBloqueioDesconto(false);
  };

  // --- CÁLCULO DE COMISSÃO (Apenas Visual) ---
  const comissaoSemDesconto = calcularSubtotal() * 0.05;
  const comissaoComDesconto = calcularTotalFinal() * 0.05;
  const perdaComissao = comissaoSemDesconto - comissaoComDesconto;

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    (c.cnpj && c.cnpj.includes(termoBusca))
  );

  const handleConfirmarPedido = () => {
    if (!clienteSelecionado) return alert("Selecione um cliente.");
    if (!pagamentoSelecionado) return alert("Selecione a forma de pagamento.");
    
    const dadosPagamento = formasPagamento.find(f => f.id === pagamentoSelecionado);
    
    // IMPORTANTE: Passa o 'usuario' (Vendedor Logado) como 4º argumento
    fecharPedido(clienteSelecionado, dadosPagamento, obsGeral, usuario);
    
    navigate('/pedidos');
  };

  const getLabelVariacao = (idProduto, idVariavel, idOpcao) => {
    const prod = produtos.find(p => p.id === idProduto);
    if (!prod) return idOpcao;
    const variacao = prod.variacoes.find(v => v.id === idVariavel);
    if (!variacao) return idOpcao;
    const opcao = variacao.opcoes.find(o => o.id === idOpcao);
    return opcao ? opcao.label : idOpcao;
  };

  if (carrinho.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShoppingBag size={40} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Carrinho Vazio</h2>
          <button onClick={() => navigate('/catalogo')} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg mt-4">Ir para o Catálogo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start">
      <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-white px-4 py-3 sticky top-0 z-20 shadow-sm flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               Carrinho <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{carrinho.length}</span>
             </h2>
          </div>
          <button onClick={limparCarrinho} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg">Limpar</button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 p-4 space-y-4 pb-80 overflow-y-auto"> 
          {carrinho.map((item) => (
            <div key={item.idItem} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative group">
              <button onClick={() => removerDoCarrinho(item.idItem)} className="absolute top-0 right-0 p-3 text-gray-300 hover:text-red-500 z-10"><X size={20} /></button>
              
              <div className="flex p-3 gap-3">
                <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                  <img src={item.produto.imagem} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight truncate">{item.produto.nome}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 mb-2 font-mono uppercase tracking-wide">{item.produto.skuBase}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(item.variacoes).map(([key, val]) => (
                      <span key={key} className="text-[10px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                        {getLabelVariacao(item.produto.id, key, val)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-3 pb-2">
                <input 
                  type="text" placeholder="Obs: ex. Braço maior..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-xs text-gray-700 focus:border-blue-500 outline-none"
                  value={item.obs || ''} onChange={(e) => atualizarObsItem(item.idItem, e.target.value)}
                />
              </div>

              <div className="bg-gray-50/50 px-3 py-2 flex justify-between items-center border-t border-gray-100">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-8">
                  <button onClick={() => atualizarQuantidade(item.idItem, -1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-blue-600 active:bg-gray-100 disabled:opacity-30" disabled={item.quantidade <= 1}><Minus size={14} /></button>
                  <span className="text-sm font-bold text-gray-800 w-6 text-center">{item.quantidade}</span>
                  <button onClick={() => atualizarQuantidade(item.idItem, 1)} className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-blue-600 active:bg-gray-100"><Plus size={14} /></button>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">Unit. <Price value={item.preco} /></div>
                  <div className="text-base font-bold text-gray-900 leading-none"><Price value={item.preco * item.quantidade} /></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- FOOTER FIXO (COM LÓGICA DE DESCONTO) --- */}
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-5 z-30 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)]">
          <div className="space-y-3">
            
            {/* Input de Desconto */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                 <Tag size={14} className="text-blue-500"/> 
                 <span className="text-xs font-bold text-gray-500 uppercase">Desconto</span>
                 
                 <div className="flex bg-gray-100 rounded-lg p-0.5 ml-2">
                    <button onClick={() => alternarTipoDesconto('R$')} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${tipoDesconto === 'R$' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>R$</button>
                    <button onClick={() => alternarTipoDesconto('%')} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${tipoDesconto === '%' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>%</button>
                 </div>
              </div>

              <div className="relative">
                {tipoDesconto === 'R$' && <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">R$</span>}
                <input 
                  type="number"
                  className={`w-20 text-right border-b border-gray-300 focus:border-blue-500 outline-none text-sm font-bold text-red-600 bg-transparent ${tipoDesconto === 'R$' ? 'pl-5' : 'pr-4'} ${bloqueioDesconto ? 'text-gray-400' : ''}`}
                  placeholder="0,00"
                  value={valorInputDesconto}
                  onChange={(e) => handleInputDesconto(e.target.value, tipoDesconto)}
                />
                {tipoDesconto === '%' && <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>}
              </div>
            </div>

            {/* --- BLOQUEIO DE GERENTE --- */}
            {bloqueioDesconto && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-pulse mb-2">
                <div className="flex items-center gap-2 text-red-700 font-bold text-xs mb-2">
                  <Lock size={12}/> Requer autorização do Gerente
                </div>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    placeholder="Senha (admin)"
                    className="flex-1 bg-white border border-red-300 rounded px-2 py-1 text-xs outline-none"
                    value={senhaGerente}
                    onChange={e => setSenhaGerente(e.target.value)}
                  />
                  <button onClick={validarSenhaGerente} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded font-bold transition-colors">
                    Liberar
                  </button>
                </div>
              </div>
            )}

            {/* Alerta de Comissão (Só Vendedor vê e se não estiver bloqueado) */}
            {usuario?.role === 'vendedor' && descontoGlobal > 0 && !bloqueioDesconto && (
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex items-center gap-2 text-[10px] text-orange-700 font-bold">
                    <AlertTriangle size={12}/> Impacto na comissão:
                 </div>
                 <div className="text-xs font-bold text-red-600">- <Price value={perdaComissao}/></div>
              </div>
            )}

            <div className="flex justify-between items-end">
              <div><span className="text-gray-400 text-xs block">Sub: <Price value={calcularSubtotal()}/></span><span className="text-gray-500 text-sm font-medium">Total Final</span></div>
              <span className="text-2xl font-extrabold text-blue-600 leading-none"><Price value={calcularTotalFinal()} /></span>
            </div>

            <button onClick={() => setModalClienteAberto(true)} disabled={bloqueioDesconto} className="w-full bg-blue-600 disabled:bg-gray-300 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg">
              FECHAR PEDIDO <ArrowRight size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* --- MODAL FECHAMENTO --- */}
        {modalClienteAberto && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalClienteAberto(false)}></div>
            <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
              
              <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-gray-800">Finalizar Venda</h3>
                <button onClick={() => setModalClienteAberto(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
              </div>

              <div className="overflow-y-auto p-4 space-y-4">
                {/* 1. Cliente */}
                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input placeholder="Buscar Cliente..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm" value={termoBusca} onChange={e => setTermoBusca(e.target.value)}/>
                   </div>
                   <div className="mt-2 max-h-[120px] overflow-y-auto space-y-1 pr-1">
                      {clientesFiltrados.map(cliente => (
                        <div key={cliente.id} onClick={() => setClienteSelecionado(cliente)} className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 text-xs ${clienteSelecionado?.id === cliente.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-100'}`}>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${clienteSelecionado?.id === cliente.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-500'}`}><User size={14}/></div>
                           <div className="flex-1 truncate"><span className="font-bold">{cliente.nome}</span> - {cliente.cidade}</div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* 2. Pagamento */}
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><CreditCard size={14}/> Forma de Pagamento</label>
                   <div className="grid grid-cols-2 gap-2">
                     {formasPagamento.map(pgto => (
                       <button key={pgto.id} onClick={() => setPagamentoSelecionado(pgto.id)} className={`p-2 rounded-lg border text-[11px] font-bold text-left transition-all ${pagamentoSelecionado === pgto.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                         {pgto.label}
                       </button>
                     ))}
                   </div>
                </div>

                {/* 3. Obs Geral */}
                <div>
                   <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1"><MessageSquare size={14}/> Obs. do Pedido</label>
                   <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none h-20" placeholder="Ex: Entregar à tarde..." value={obsGeral} onChange={(e) => setObsGeral(e.target.value)}></textarea>
                </div>

                {/* 4. Confirmação */}
                <div className="pt-2">
                   <div className="flex justify-between items-center mb-3 text-sm">
                     <span className="text-gray-500">Valor Total:</span>
                     <span className="font-bold text-gray-900 text-lg"><Price value={calcularTotalFinal()} /></span>
                   </div>
                   <button onClick={handleConfirmarPedido} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all">
                     CONFIRMAR PEDIDO
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}