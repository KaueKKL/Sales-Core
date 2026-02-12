import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, CheckCircle, Grid3X3, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { usePedidos } from '../context/PedidosContext';

const Price = ({ value }) => (
  <span className="font-bold text-green-700 whitespace-nowrap">
    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
  </span>
);

export default function ProdutoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getProduto } = useAdmin();
  const produto = getProduto(id);
  const { adicionarAoCarrinho } = usePedidos();

  const [selecoes, setSelecoes] = useState({});
  const [precoTotal, setPrecoTotal] = useState(0);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [mostrarTabela, setMostrarTabela] = useState(true);

  // Inicializa Padrões
  useEffect(() => {
    if (produto) {
      const defaults = {};
      produto.variacoes.forEach(v => {
        defaults[v.id] = v.opcoes[0].id;
      });
      setSelecoes(defaults);
    }
  }, [produto]);

  // Calcula Preço
  useEffect(() => {
    if (!produto) return;
    if (produto.tipoPrecificacao === 'matriz' && produto.tabelaPrecos) {
      const valorX = selecoes[produto.eixoX];
      const valorY = selecoes[produto.eixoY];
      if (valorX && valorY) {
        const chaveTabela = `${valorX}_${valorY}`;
        setPrecoTotal(produto.tabelaPrecos[chaveTabela] || 0);
      }
    } else {
      let total = produto.precoBase || 0;
      produto.variacoes.forEach(varGroup => {
        const opcao = varGroup.opcoes.find(op => op.id === selecoes[varGroup.id]);
        if (opcao?.acrescimo) total += opcao.acrescimo;
      });
      setPrecoTotal(total);
    }
  }, [selecoes, produto]);

  const handleSelect = (grupoId, opcaoId) => setSelecoes(prev => ({ ...prev, [grupoId]: opcaoId }));
  
  const selecionarPelaGrade = (idOpcaoX, idOpcaoY) => {
    setSelecoes(prev => ({ ...prev, [produto.eixoX]: idOpcaoX, [produto.eixoY]: idOpcaoY }));
  };

  const handleAdicionarAoCarrinho = () => {
    adicionarAoCarrinho(produto, selecoes, precoTotal);
    setModalSucessoAberto(true);
  };

  const renderizarGradePrecos = () => {
    if (!produto || produto.tipoPrecificacao !== 'matriz' || !produto.tabelaPrecos) return null;
    const grupoX = produto.variacoes.find(v => v.id === produto.eixoX);
    const grupoY = produto.variacoes.find(v => v.id === produto.eixoY);
    if (!grupoX || !grupoY) return null;

    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="flex items-center gap-2 mb-3 cursor-pointer text-blue-600 hover:text-blue-800" onClick={() => setMostrarTabela(!mostrarTabela)}>
          <Grid3X3 size={20} />
          <h3 className="font-bold text-sm uppercase tracking-wider">Tabela de Preços</h3>
        </div>
        {mostrarTabela && (
          <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto pb-1 scrollbar-hide">
              <table className="min-w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 bg-gray-100 border-b border-r border-gray-200 sticky left-0 top-0 z-20 min-w-[100px] text-left">
                      <span className="text-gray-500 font-medium italic block text-[10px] leading-tight">{grupoY.titulo} ↓<br/>{grupoX.titulo} →</span>
                    </th>
                    {grupoX.opcoes.map(col => (
                      <th key={col.id} className="p-2 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 min-w-[80px] whitespace-nowrap sticky top-0 z-10">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grupoY.opcoes.map((linha, idx) => (
                    <tr key={linha.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <th className="p-2 bg-gray-100 border-r border-gray-200 font-bold text-gray-700 text-left sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                         <div className="flex items-center gap-2 whitespace-nowrap px-1">
                           {linha.hex && <div className="w-3 h-3 rounded-full border border-gray-300 shadow-sm shrink-0" style={{background: linha.hex}}></div>}
                           <span className="truncate max-w-[90px]" title={linha.label}>{linha.label}</span>
                         </div>
                      </th>
                      {grupoX.opcoes.map(col => {
                        const chave = `${col.id}_${linha.id}`;
                        const preco = produto.tabelaPrecos?.[chave];
                        const isSelected = selecoes[produto.eixoX] === col.id && selecoes[produto.eixoY] === linha.id;
                        return (
                          <td key={chave} onClick={() => selecionarPelaGrade(col.id, linha.id)}
                            className={`p-2 border-r border-gray-100 cursor-pointer transition-all duration-200 whitespace-nowrap ${isSelected ? 'bg-blue-600 text-white font-bold shadow-inner' : 'hover:bg-blue-100 text-gray-600'}`}>
                            {preco ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(preco) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!produto) return <div className="p-10 text-center text-gray-500">Produto não encontrado.</div>;

  return (
    // Wrapper Geral: No desktop tem fundo cinza e centraliza o card. No mobile é tela cheia branca.
    <div className="min-h-screen bg-white md:bg-gray-100 md:flex md:items-center md:justify-center md:py-10">
      
      {/* Container Responsivo: Mobile = Full / Desktop = Card Sombra Arredondado */}
      <div className="bg-white w-full max-w-6xl md:rounded-3xl md:shadow-2xl md:overflow-hidden flex flex-col md:flex-row h-full md:h-[85vh]">
        
        {/* COLUNA ESQUERDA: IMAGEM */}
        <div className="w-full md:w-1/2 h-72 md:h-full bg-gray-200 relative group shrink-0">
          <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover"/>
          
          {/* Botão Voltar (Mobile) */}
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-gray-700 hover:bg-white md:hidden">
            <ChevronLeft size={24} />
          </button>

          {/* Overlay com Título (Mobile) */}
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-20 md:hidden">
            <h1 className="text-white text-2xl font-bold leading-tight shadow-black drop-shadow-md">{produto.nome}</h1>
            <p className="text-gray-200 text-sm mt-1 font-medium bg-black/30 w-fit px-2 py-0.5 rounded backdrop-blur-md">Ref: {produto.skuBase}</p>
          </div>
        </div>

        {/* COLUNA DIREITA: CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          
          {/* Header Desktop (Título) */}
          <div className="hidden md:flex items-center gap-4 p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
             <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ArrowLeft/></button>
             <div>
               <h1 className="text-2xl font-bold text-gray-800 leading-none">{produto.nome}</h1>
               <span className="text-xs text-gray-400 font-mono uppercase">Ref: {produto.skuBase}</span>
             </div>
          </div>

          {/* Corpo com Scroll */}
          <div className="flex-1 overflow-y-auto p-5 pb-32 md:pb-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
             <p className="text-gray-600 text-sm leading-relaxed">{produto.descricao}</p>
             
             {/* Renderiza Tabela ou Botões de Variação */}
             {renderizarGradePrecos()}

             <div className="space-y-6">
              {produto.variacoes.map((grupo) => (
                <div key={grupo.id}>
                  <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider flex justify-between items-center border-b border-gray-100 pb-2">
                    {grupo.titulo} <span className="text-blue-600 normal-case font-normal ml-2">{grupo.opcoes.find(o => o.id === selecoes[grupo.id])?.label}</span>
                  </h3>
                  <div className={`grid gap-3 ${grupo.tipo === 'card' ? 'grid-cols-1' : 'flex flex-wrap'}`}>
                    {grupo.opcoes.map((opcao) => {
                      const isSelected = selecoes[grupo.id] === opcao.id;
                      return (
                        <button key={opcao.id} onClick={() => handleSelect(grupo.id, opcao.id)}
                          className={`relative p-3 rounded-xl border text-left transition-all duration-200 group 
                            ${isSelected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm' : 'border-gray-200 hover:border-blue-300 bg-white'} 
                            ${grupo.tipo === 'pill' ? 'flex-1 min-w-[100px] text-center justify-center' : ''} 
                            ${grupo.tipo === 'color' ? 'w-14 h-14 p-1' : ''}`}
                        >
                          {grupo.tipo === 'color' ? (
                            <div className="w-full h-full rounded-full shadow-sm border border-black/10 transition-transform group-active:scale-90" style={{ backgroundColor: opcao.hex }} title={opcao.label} />
                          ) : (
                            <div>
                              <div className={`font-medium text-sm ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{opcao.label}</div>
                              {produto.tipoPrecificacao !== 'matriz' && opcao.acrescimo > 0 && <div className="text-xs text-green-600 font-bold mt-1 bg-green-50 inline-block px-1 rounded">+ <Price value={opcao.acrescimo} /></div>}
                            </div>
                          )}
                          {isSelected && grupo.tipo !== 'color' && <div className="absolute top-3 right-3 text-blue-600 bg-white rounded-full"><CheckCircle size={16} fill="currentColor" className="text-white bg-blue-600 rounded-full"/></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer (Preço e Botão) */}
          {/* Mobile: Fixo Bottom | Desktop: Sticky Bottom do Container */}
          <div className="fixed bottom-0 left-0 right-0 z-30 md:static md:z-auto bg-white border-t border-gray-200 p-4 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
            <div className="max-w-md mx-auto md:max-w-none flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <div>
                 <span className="text-gray-400 text-xs block mb-1 md:hidden">Valor Total</span>
                 <div className="text-3xl font-extrabold text-gray-900 leading-none"><Price value={precoTotal} /></div>
                 <div className="text-xs text-gray-400 mt-1">10x de <span className="font-bold text-gray-600"><Price value={precoTotal/10} /></span></div>
               </div>
               <button onClick={handleAdicionarAoCarrinho} className="w-full md:w-auto md:px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg">
                 <ShoppingCart size={22} strokeWidth={2.5} /> <span className="md:hidden">Adicionar</span> <span className="hidden md:inline">Adicionar ao Carrinho</span>
               </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Sucesso */}
      {modalSucessoAberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setModalSucessoAberto(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} strokeWidth={3} /></div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Adicionado!</h2>
            <p className="text-sm text-gray-500 mb-6">O produto foi para seu carrinho.</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => navigate('/carrinho')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700">Ir para o Carrinho</button>
              <button onClick={() => navigate('/catalogo')} className="w-full bg-gray-50 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100">Continuar Vendendo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}