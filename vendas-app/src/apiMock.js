// src/apiMock.js

// Simula o tempo de resposta da rede e a lógica do DAV-ADAPTER
export const enviarPedido = async (pedido) => {
  return new Promise((resolve) => {
    console.log("📡 Enviando pedido para o Adapter...", pedido);
    
    setTimeout(() => {
      // Aqui simulamos o Adapter gerando o SKU legado baseado nas escolhas
      // Ex: SOFA-BASE + SUEDE + AZUL -> SKU: SOFA-SUE-AZ-3L
      
      const skuGerado = `${pedido.item.skuBase}-${pedido.variacoes.tecido.substring(0,3).toUpperCase()}-${pedido.variacoes.cor.substring(0,3).toUpperCase()}`;
      
      resolve({
        sucesso: true,
        mensagem: "DAV #998812 criado com sucesso no ERP!",
        sku_legado_gerado: skuGerado,
        valor_final: pedido.total
      });
    }, 1500); // 1.5 segundos de "loading"
  });
};