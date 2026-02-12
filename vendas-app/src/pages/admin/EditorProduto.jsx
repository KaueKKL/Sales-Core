// src/pages/admin/EditorProduto.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Save, ArrowLeft, DollarSign, List, Grid, Layers, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export default function EditorProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProduto, atualizarProduto, variacoesGlobais } = useAdmin();

  const [form, setForm] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('variacoes'); // Começa na aba nova para você ver

  useEffect(() => {
    const dados = getProduto(id);
    if (dados) setForm(JSON.parse(JSON.stringify(dados))); // Deep copy para não alterar estado direto
  }, [id, getProduto]);

  if (!form) return <div className="p-10 text-center">Carregando...</div>;

  const handleSalvar = () => {
    atualizarProduto(id, form);
    alert('Produto salvo!');
    navigate('/admin');
  };

  // --- LÓGICA DE VARIAÇÕES ---

  // 1. Adicionar um Grupo Inteiro (Ex: Adicionar "Tecido" ao produto)
  const adicionarGrupoVariavel = (varGlobal) => {
    // Verifica se já tem
    if (form.variacoes.find(v => v.id === varGlobal.id)) return;

    // Adiciona ao produto com TODAS as opções desmarcadas ou marcadas (decisão de design)
    // Aqui vamos adicionar com as opções vazias, para o usuário marcar
    const novoGrupo = {
      ...varGlobal,
      opcoes: [] // Começa vazio para o usuário selecionar
    };
    setForm(prev => ({ ...prev, variacoes: [...prev.variacoes, novoGrupo] }));
  };

  const removerGrupoVariavel = (idGrupo) => {
    setForm(prev => ({
      ...prev,
      variacoes: prev.variacoes.filter(v => v.id !== idGrupo)
    }));
  };

  // 2. Lógica do Checkbox (Toggle Opção)
  const toggleOpcao = (idGrupo, opcaoGlobal) => {
    setForm(prev => {
      const novasVariacoes = prev.variacoes.map(grupo => {
        if (grupo.id !== idGrupo) return grupo;

        // Verifica se a opção já está na lista do produto
        const jaExiste = grupo.opcoes.find(op => op.id === opcaoGlobal.id);

        let novasOpcoes;
        if (jaExiste) {
          // REMOVER: Filtra fora
          novasOpcoes = grupo.opcoes.filter(op => op.id !== opcaoGlobal.id);
        } else {
          // ADICIONAR: Coloca na lista
          novasOpcoes = [...grupo.opcoes, opcaoGlobal];
        }

        return { ...grupo, opcoes: novasOpcoes };
      });

      return { ...prev, variacoes: novasVariacoes };
    });
  };

  // --- RENDERIZADORES ---

  const renderEditorMatriz = () => {
    if (!form.eixoX || !form.eixoY) return <div className="text-red-500 text-sm">Configure os eixos na aba Geral.</div>;
    const grupoX = form.variacoes.find(v => v.id === form.eixoX);
    const grupoY = form.variacoes.find(v => v.id === form.eixoY);
    if (!grupoX || !grupoY) return <div className="text-orange-500 text-sm">Adicione variações na aba Variações.</div>;

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full text-xs text-center">
          <thead>
            <tr>
              <th className="p-2 bg-gray-100 border-b text-left">{grupoY.titulo} \ {grupoX.titulo}</th>
              {grupoX.opcoes.map(col => <th key={col.id} className="p-2 bg-gray-50 border-b">{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {grupoY.opcoes.map(linha => (
              <tr key={linha.id}>
                <th className="p-2 bg-gray-50 text-left border-r font-medium">{linha.label}</th>
                {grupoX.opcoes.map(col => {
                  const chave = `${col.id}_${linha.id}`;
                  return (
                    <td key={chave} className="border-r border-b p-1">
                      <input 
                        type="number" 
                        className="w-full text-center font-bold text-blue-700 outline-none"
                        value={form.tabelaPrecos?.[chave] || 0}
                        onChange={(e) => setForm(prev => ({...prev, tabelaPrecos: {...prev.tabelaPrecos, [chave]: parseFloat(e.target.value)}}))}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-safe">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><ArrowLeft size={24} /></button>
          <div><h1 className="font-bold text-gray-800 text-lg leading-none">Editar Produto</h1></div>
        </div>
        <button onClick={handleSalvar} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 active:scale-95 text-sm">
          <Save size={18} /> Salvar
        </button>
      </div>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        
        {/* Info Produto */}
        <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm">
          <img src={form.imagem} className="w-16 h-16 rounded-md object-cover bg-gray-200" />
          <div className="flex-1">
             <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full font-bold text-gray-800 border-b border-gray-200 focus:border-blue-500 outline-none py-1 text-sm"/>
          </div>
        </div>

        {/* Navegação de Abas */}
        <div className="flex bg-gray-200 rounded-lg p-1 overflow-x-auto">
          {[
            { id: 'geral', label: 'Geral', icon: List },
            { id: 'variacoes', label: 'Variações', icon: Layers }, // ABA NOVA
            { id: 'precos', label: 'Preços', icon: DollarSign },
          ].map(aba => (
            <button 
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-1 py-2 px-3 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 whitespace-nowrap ${abaAtiva === aba.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              <aba.icon size={16}/> {aba.label}
            </button>
          ))}
        </div>

        {/* === CONTEÚDO DA ABA VARIAÇÕES (A LÓGICA DO "PODE/NÃO PODE") === */}
        {abaAtiva === 'variacoes' && (
          <div className="space-y-6 animate-in slide-in-from-right-2 duration-200">
            
            {/* 1. Botões para Adicionar Grupos do Global */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Importar do Banco de Dados Global</h3>
              <div className="flex flex-wrap gap-2">
                {variacoesGlobais.map(vGlobal => {
                  const jaTem = form.variacoes.some(v => v.id === vGlobal.id);
                  return (
                    <button
                      key={vGlobal.id}
                      onClick={() => adicionarGrupoVariavel(vGlobal)}
                      disabled={jaTem}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${jaTem ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}
                    >
                      {jaTem ? 'Adicionado' : <Plus size={14}/>}
                      {vGlobal.titulo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Lista de Grupos Ativos no Produto */}
            {form.variacoes.map((grupo) => {
              // Encontra o "Pai" Global para saber todas as opções possíveis
              const globalPai = variacoesGlobais.find(g => g.id === grupo.id) || grupo;

              return (
                <div key={grupo.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <Layers size={18} className="text-blue-500"/> {grupo.titulo}
                    </h3>
                    <button onClick={() => removerGrupoVariavel(grupo.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16}/>
                    </button>
                  </div>

                  {/* Lista de Checkboxes (O QUE PODE vs O QUE NÃO PODE) */}
                  <div className="grid grid-cols-1 gap-2">
                    {globalPai.opcoes.map(opcaoGlobal => {
                      // Verifica se esta opção está ativa neste produto
                      const estaAtivo = grupo.opcoes.some(op => op.id === opcaoGlobal.id);

                      return (
                        <div 
                          key={opcaoGlobal.id}
                          onClick={() => toggleOpcao(grupo.id, opcaoGlobal)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all ${estaAtivo ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                        >
                          <div className={`text-blue-600 ${estaAtivo ? 'opacity-100' : 'opacity-30'}`}>
                            {estaAtivo ? <CheckSquare size={20} /> : <Square size={20} />}
                          </div>
                          
                          {/* Visual da Opção (Cor ou Texto) */}
                          {grupo.tipo === 'color' && (
                            <div className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{backgroundColor: opcaoGlobal.hex}}></div>
                          )}
                          
                          <span className={`text-sm font-medium ${estaAtivo ? 'text-gray-900' : 'text-gray-400'}`}>
                            {opcaoGlobal.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-right">
                    {grupo.opcoes.length} de {globalPai.opcoes.length} opções ativas
                  </p>
                </div>
              );
            })}
             
             {form.variacoes.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                 Nenhuma variação configurada. Adicione acima.
               </div>
             )}
          </div>
        )}

        {/* ABA: GERAL */}
        {abaAtiva === 'geral' && (
          <div className="bg-white p-5 rounded-xl shadow-sm space-y-4 animate-in slide-in-from-left-2 duration-200">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lógica de Preço</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setForm({...form, tipoPrecificacao: 'soma'})} className={`border rounded-lg p-3 text-left ${form.tipoPrecificacao === 'soma' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="font-bold text-sm">Soma</div><div className="text-[10px] text-gray-500">Base + Extras</div>
                </button>
                <button onClick={() => setForm({...form, tipoPrecificacao: 'matriz'})} className={`border rounded-lg p-3 text-left ${form.tipoPrecificacao === 'matriz' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="font-bold text-sm">Matriz</div><div className="text-[10px] text-gray-500">Tabela Cruzada</div>
                </button>
              </div>
            </div>
            {form.tipoPrecificacao === 'matriz' && (
               <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                 <h4 className="font-bold text-orange-800 text-xs mb-2 uppercase">Eixos da Tabela</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-orange-600 font-bold block mb-1">Colunas (X)</label>
                      <select className="w-full p-2 bg-white border border-orange-200 rounded text-xs" value={form.eixoX || ''} onChange={e => setForm({...form, eixoX: e.target.value})}>
                         <option value="">Selecione...</option>
                         {form.variacoes.map(v => <option key={v.id} value={v.id}>{v.titulo}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-orange-600 font-bold block mb-1">Linhas (Y)</label>
                      <select className="w-full p-2 bg-white border border-orange-200 rounded text-xs" value={form.eixoY || ''} onChange={e => setForm({...form, eixoY: e.target.value})}>
                         <option value="">Selecione...</option>
                         {form.variacoes.map(v => <option key={v.id} value={v.id}>{v.titulo}</option>)}
                      </select>
                    </div>
                 </div>
               </div>
            )}
          </div>
        )}

        {/* ABA: PREÇOS */}
        {abaAtiva === 'precos' && (
          <div className="bg-white p-5 rounded-xl shadow-sm space-y-4 animate-in slide-in-from-right-2 duration-200">
             {form.tipoPrecificacao === 'soma' ? (
               <div>
                 <label className="block text-sm font-bold text-gray-700">Preço Base (R$)</label>
                 <input type="number" value={form.precoBase} onChange={e => setForm({...form, precoBase: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-3 text-lg font-bold text-gray-800 mt-1"/>
               </div>
             ) : (
               <>
                  <div className="flex justify-between items-center"><h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><Grid size={16}/> Tabela de Preços</h3></div>
                  {renderEditorMatriz()}
               </>
             )}
          </div>
        )}

      </div>
    </div>
  );
}