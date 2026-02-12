import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { usePedidos } from '../context/PedidosContext';
import { 
  ShoppingCart, Search, LayoutList, Grid2X2, Grid3X3, Filter, X, ArrowRight, Eye, EyeOff 
} from 'lucide-react';

export default function Catalogo() {
  const navigate = useNavigate();
  const { produtos } = useAdmin();
  const { carrinho } = usePedidos();

  const [termoBusca, setTermoBusca] = useState('');
  const [colunas, setColunas] = useState(2); 
  const [modoApresentacao, setModoApresentacao] = useState(false); // <--- NOVO ESTADO

  const produtosFiltrados = produtos.filter(prod => {
    const termo = termoBusca.toLowerCase();
    return (
      prod.nome.toLowerCase().includes(termo) ||
      prod.skuBase.toLowerCase().includes(termo)
    );
  });

  return (
    <div className={`min-h-screen bg-gray-50 ${modoApresentacao ? '' : 'pb-24'}`}>
      
      {/* HEADER */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-30 border-b border-gray-100 transition-all">
        
        {/* Busca (Oculta se estiver em modo apresentação para ficar limpo) */}
        {!modoApresentacao && (
          <div className="relative mb-4 group animate-in slide-in-from-top-2">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
             <input 
               type="text"
               placeholder="Buscar produto..."
               value={termoBusca}
               onChange={(e) => setTermoBusca(e.target.value)}
               className="w-full pl-12 pr-10 py-3.5 bg-gray-100 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 outline-none transition-all shadow-inner"
             />
             {termoBusca && <button onClick={() => setTermoBusca('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"><X size={18}/></button>}
          </div>
        )}

        <div className="flex justify-between items-center">
           <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
             {produtosFiltrados.length} itens
             
             {/* BOTÃO TOGGLE MODO APRESENTAÇÃO */}
             <button 
               onClick={() => setModoApresentacao(!modoApresentacao)}
               className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${modoApresentacao ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
             >
               {modoApresentacao ? <><Eye size={12}/> MODO CLIENTE</> : <><EyeOff size={12}/> MODO VENDEDOR</>}
             </button>
           </div>
           
           {!modoApresentacao && (
             <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setColunas(1)} className={`p-2 rounded-lg transition-all ${colunas === 1 ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}><LayoutList size={20}/></button>
                <button onClick={() => setColunas(2)} className={`p-2 rounded-lg transition-all ${colunas === 2 ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}><Grid2X2 size={20}/></button>
                <button onClick={() => setColunas(3)} className={`p-2 rounded-lg transition-all ${colunas === 3 ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}><Grid3X3 size={20}/></button>
             </div>
           )}
        </div>
      </div>

      {/* GRID */}
      <div className={`p-6 grid gap-6 transition-all duration-300 ease-in-out
          ${colunas === 1 ? 'grid-cols-1' : ''}
          ${colunas === 2 ? 'grid-cols-2' : ''}
          ${colunas === 3 ? 'grid-cols-3' : ''}
      `}>
        {produtosFiltrados.map((prod) => (
          <div 
            key={prod.id}
            onClick={() => navigate(`/produto/${prod.id}`)}
            className={`
              group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300
              ${colunas === 1 ? 'flex flex-row items-stretch' : 'flex flex-col'}
            `}
          >
            <div className={`bg-gray-100 overflow-hidden shrink-0 relative ${colunas === 1 ? 'w-40' : 'w-full aspect-[4/3]'}`}>
              <img src={prod.imagem} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={prod.nome} loading="lazy" />
            </div>

            <div className={`flex flex-col justify-between ${colunas === 1 ? 'flex-1 p-5 pl-6' : 'p-4'}`}>
              <div>
                <h3 className={`font-bold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors ${colunas === 3 ? 'text-sm' : 'text-base'}`}>{prod.nome}</h3>
                
                {/* Se NÃO for Modo Apresentação, mostra SKU e Descrição */}
                {!modoApresentacao && (
                  <>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ref: {prod.skuBase}</p>
                    {colunas === 1 && <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{prod.descricao || "Produto de alta qualidade..."}</p>}
                  </>
                )}
              </div>
              
              {/* Rodapé do Card (Preço e Ação) - ESCONDIDO NO MODO APRESENTAÇÃO */}
              {!modoApresentacao && (
                <div className="flex items-end justify-between mt-3 animate-in fade-in">
                  <div>
                    <p className="text-[10px] text-gray-400 mb-0.5">A partir de</p>
                    <p className={`font-bold text-blue-900 leading-none ${colunas === 3 ? 'text-sm' : 'text-lg'}`}>
                      {prod.tipoPrecificacao === 'soma' ? `R$ ${prod.precoBase.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Ver Tabela</span>}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${colunas === 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                    {colunas === 1 ? <ShoppingCart size={16}/> : <ArrowRight size={16}/>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* BOTÃO FLUTUANTE CARRINHO - Esconde na apresentação */}
      {carrinho.length > 0 && !modoApresentacao && (
        <button 
          onClick={() => navigate('/carrinho')}
          className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl shadow-blue-600/40 z-40 hover:scale-110 active:scale-95 transition-all group"
        >
          <ShoppingCart className="group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">{carrinho.length}</span>
        </button>
      )}
    </div>
  );
}