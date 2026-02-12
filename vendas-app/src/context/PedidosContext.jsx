import React, { createContext, useState, useContext } from 'react';
import { enviarPedido } from '../apiMock';

const PedidosContext = createContext();

// --- DADOS MOCKADOS COM MÚLTIPLOS VENDEDORES ---
const pedidosIniciais = [
  {
    id: 1001,
    data: "2026-01-28T09:30:00.000Z",
    status: 'TRANSMITIDO',
    total: 4560.00,
    subtotal: 4800.00,
    desconto: 240.00,
    comissaoTotal: 228.00,
    pagamento: { id: 'credito_10x', label: 'Cartão 10x', parcelas: 10 },
    cliente: { id: 101, nome: "Móveis Silva & Filhos", cidade: "Curitiba/PR" },
    vendedor: { id: 1, nome: "Carlos (Gerente)" }, // Venda do Carlos
    retornoErp: { sku_legado_gerado: "RET-CONF-290-VEL-AZ" },
    itens: [
      {
        idItem: 1, quantidade: 1, preco: 4800.00,
        produto: { id: "est-sofa-ret-01", nome: "Sofá Retrátil 'Confort Plus'", skuBase: "RET-CONF", imagem: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80" },
        variacoes: { largura: "2,90m", tecido: "veludo", cor: "azul" }
      }
    ]
  },
  {
    id: 1002,
    data: "2026-01-28T14:15:00.000Z",
    status: 'TRANSMITIDO',
    total: 2360.00,
    subtotal: 2360.00,
    desconto: 0,
    comissaoTotal: 118.00,
    pagamento: { id: 'pix', label: 'PIX', parcelas: 1 },
    cliente: { id: 102, nome: "Casa Cor Decorações", cidade: "São Paulo/SP" },
    vendedor: { id: 1, nome: "Carlos (Gerente)" }, // Venda do Carlos
    retornoErp: { sku_legado_gerado: "CAD-JANTAR-CAP-LIN-4X" },
    itens: [
      {
        idItem: 2, quantidade: 4, preco: 590.00,
        produto: { id: "est-cad-jantar", nome: "Cadeira de Jantar Estofada", skuBase: "CAD-JANTAR", imagem: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=600&q=80" },
        variacoes: { modelo: "capitone", tecido: "linho", pes: "mel" }
      }
    ]
  },
  {
    id: 1005,
    data: "2026-01-30T10:00:00.000Z",
    status: 'TRANSMITIDO',
    total: 12500.00, 
    subtotal: 12500.00,
    desconto: 0,
    comissaoTotal: 625.00,
    pagamento: { id: 'boleto_30', label: 'Boleto 30 Dias', parcelas: 1 },
    cliente: { id: 103, nome: "Hotel Plaza Inn", cidade: "Florianópolis/SC" },
    vendedor: { id: 3, nome: "João (Externo)" }, // Venda do JOÃO (Outro vendedor)
    retornoErp: { sku_legado_gerado: "PROJ-HOTEL-001" },
    itens: [
      {
        idItem: 10, quantidade: 2, preco: 6250.00,
        produto: { id: "est-sofa-canto", nome: "Sofá de Canto Modular", skuBase: "CANTO-MOD", imagem: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80" },
        variacoes: { configuracao: "3x3", tecido: "boucle" }
      }
    ]
  }
];

export function PedidosProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [descontoGlobal, setDescontoGlobal] = useState(0); 

  const adicionarAoCarrinho = (produto, variacoes, precoUnitario) => {
    const indexExistente = carrinho.findIndex(item => 
      item.produto.id === produto.id && 
      JSON.stringify(item.variacoes) === JSON.stringify(variacoes)
    );

    if (indexExistente >= 0) {
      const novoCarrinho = [...carrinho];
      novoCarrinho[indexExistente].quantidade += 1;
      setCarrinho(novoCarrinho);
    } else {
      const novoItem = {
        idItem: Date.now(),
        produto: { id: produto.id, nome: produto.nome, skuBase: produto.skuBase, imagem: produto.imagem },
        variacoes: variacoes,
        preco: precoUnitario,
        quantidade: 1,
        obs: ''
      };
      setCarrinho(prev => [...prev, novoItem]);
    }
  };

  const atualizarQuantidade = (idItem, delta) => {
    setCarrinho(prev => prev.map(item => {
      if (item.idItem === idItem) {
        const novaQtd = item.quantidade + delta;
        return novaQtd > 0 ? { ...item, quantidade: novaQtd } : item;
      }
      return item;
    }));
  };

  const atualizarObsItem = (idItem, texto) => {
    setCarrinho(prev => prev.map(item => item.idItem === idItem ? { ...item, obs: texto } : item));
  };

  const removerDoCarrinho = (idItem) => setCarrinho(prev => prev.filter(i => i.idItem !== idItem));
  
  const limparCarrinho = () => {
    setCarrinho([]);
    setDescontoGlobal(0);
  };

  const calcularSubtotal = () => carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  
  const calcularTotalFinal = () => {
    const sub = calcularSubtotal();
    return Math.max(0, sub - descontoGlobal);
  };

  // --- FECHAR PEDIDO COM VENDEDOR LOGADO ---
  // (Precisamos injetar o usuario aqui ou passar como argumento)
  // Para simplificar, passaremos o 'usuario' como argumento vindo do Carrinho
  const fecharPedido = (cliente, pagamento, observacaoGeral, vendedorLogado) => {
    if (carrinho.length === 0) return null;
    
    const subtotal = calcularSubtotal();
    const total = calcularTotalFinal();
    
    const novoPedido = {
      id: Date.now(),
      data: new Date().toISOString(),
      status: 'RASCUNHO',
      cliente: cliente,
      vendedor: vendedorLogado, // <--- SALVA QUEM VENDEU
      pagamento: pagamento,
      observacao: observacaoGeral,
      desconto: descontoGlobal,
      subtotal: subtotal,
      total: total,
      comissaoTotal: total * 0.05, 
      itens: [...carrinho],
      retornoErp: null
    };

    setPedidos(prev => [novoPedido, ...prev]);
    limparCarrinho();
    return novoPedido.id;
  };

  const editarRascunho = (idPedido) => {
    const pedidoAlvo = pedidos.find(p => p.id === idPedido);
    if (!pedidoAlvo) return;
    setCarrinho(pedidoAlvo.itens);
    setDescontoGlobal(pedidoAlvo.desconto || 0);
    removerPedido(idPedido);
  };

  const removerPedido = (id) => setPedidos(prev => prev.filter(p => p.id !== id));

  const transmitirPedido = async (idPedido) => {
    setPedidos(prev => prev.map(p => p.id === idPedido ? { ...p, status: 'TRANSMITINDO' } : p));
    try {
      const pedidoParaEnvio = pedidos.find(p => p.id === idPedido);
      const resposta = await enviarPedido(pedidoParaEnvio);
      setPedidos(prev => prev.map(p => p.id === idPedido ? { ...p, status: 'TRANSMITIDO', retornoErp: resposta } : p));
    } catch (error) {
      setPedidos(prev => prev.map(p => p.id === idPedido ? { ...p, status: 'ERRO' } : p));
    }
  };

  return (
    <PedidosContext.Provider value={{ 
      carrinho, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho, atualizarQuantidade, atualizarObsItem,
      calcularSubtotal, calcularTotalFinal, descontoGlobal, setDescontoGlobal,
      pedidos, removerPedido, transmitirPedido, fecharPedido, editarRascunho
    }}>
      {children}
    </PedidosContext.Provider>
  );
}

export const usePedidos = () => useContext(PedidosContext);