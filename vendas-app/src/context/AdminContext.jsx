import React, { createContext, useState, useContext } from 'react';
import { produtosMock } from '../mockData';

const AdminContext = createContext();

// Mock de Clientes
const clientesMock = [
  { id: 101, nome: "Móveis Silva & Filhos", cidade: "Curitiba/PR", cnpj: "12.345.678/0001-90" },
  { id: 102, nome: "Casa Cor Decorações", cidade: "São Paulo/SP", cnpj: "98.765.432/0001-10" },
  { id: 103, nome: "Hotel Plaza Inn", cidade: "Florianópolis/SC", cnpj: "45.123.789/0001-55" },
  { id: 104, nome: "Consumidor Final", cidade: "-", cnpj: null },
];

// Mock de Formas de Pagamento (NOVO)
const formasPagamentoMock = [
  { id: 'pix', label: 'PIX / Dinheiro (5% desc)', parcelas: 1, taxa: 0 },
  { id: 'boleto_30', label: 'Boleto 30 dias', parcelas: 1, taxa: 0 },
  { id: 'credito_1x', label: 'Cartão Crédito (1x)', parcelas: 1, taxa: 0 },
  { id: 'credito_3x', label: 'Cartão Crédito (3x)', parcelas: 3, taxa: 0 },
  { id: 'credito_6x', label: 'Cartão Crédito (6x)', parcelas: 6, taxa: 0 },
  { id: 'credito_10x', label: 'Cartão Crédito (10x)', parcelas: 10, taxa: 0 },
];

export function AdminProvider({ children }) {
  const [produtos, setProdutos] = useState(produtosMock);
  const [clientes] = useState(clientesMock);
  const [formasPagamento] = useState(formasPagamentoMock); // <---

  // Variações Globais
  const [variacoesGlobais, setVariacoesGlobais] = useState([
    {
      id: 'tecidos_2026', titulo: 'Tecidos Padrão', tipo: 'card',
      opcoes: [
        { id: 'suede', label: 'Suede Liso' },
        { id: 'linho', label: 'Linho Misto' },
        { id: 'veludo', label: 'Veludo Premium' },
        { id: 'couro', label: 'Couro Natural' }
      ]
    },
    {
      id: 'cores_padrao', titulo: 'Cores Padrão', tipo: 'color',
      opcoes: [
        { id: 'bege', label: 'Bege', hex: '#e5d0b1' },
        { id: 'cinza', label: 'Cinza', hex: "#4b5563" },
        { id: 'azul', label: 'Azul', hex: "#1e3a8a" },
        { id: 'preto', label: 'Preto', hex: "#111" }
      ]
    }
  ]);

  const atualizarProduto = (idProduto, novosDados) => {
    setProdutos(prev => prev.map(p => p.id === idProduto ? { ...p, ...novosDados } : p));
  };

  const getProduto = (id) => produtos.find(p => p.id === id);

  return (
    <AdminContext.Provider value={{ 
      produtos, atualizarProduto, getProduto, 
      variacoesGlobais, clientes, formasPagamento 
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);