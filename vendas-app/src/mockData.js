// src/mockData.js

// PRODUTOS "REAIS" (Detalhados para demonstração)
const produtosBase = [
  {
    id: "est-sofa-ret-01",
    nome: "Sofá Retrátil 'Confort Plus'",
    skuBase: "RET-CONF",
    descricao: "Estrutura em Eucalipto tratado, molas ensacadas e espuma D33 Soft. Abertura total de 1.80m.",
    imagem: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    tipoPrecificacao: "matriz",
    eixoX: "largura", eixoY: "tecido", precoBase: 0,
    variacoes: [
      { id: "largura", titulo: "Largura", tipo: "pill", opcoes: [{ id: "2,10m", label: "2,10m" }, { id: "2,50m", label: "2,50m" }] },
      { id: "tecido", titulo: "Revestimento", tipo: "card", opcoes: [{ id: "suede", label: "Suede" }, { id: "linho", label: "Linho" }] }
    ],
    tabelaPrecos: { "2,10m_suede": 2400, "2,10m_linho": 2850, "2,50m_suede": 2900, "2,50m_linho": 3500 }
  },
  {
    id: "est-polt-chester",
    nome: "Poltrona Chesterfield",
    skuBase: "POLT-CHEST",
    descricao: "Design clássico inglês com capitonê feito à mão.",
    imagem: "https://images.unsplash.com/photo-1551298698-66b830a4f11c?auto=format&fit=crop&w=600&q=80",
    tipoPrecificacao: "soma",
    precoBase: 1890.00,
    variacoes: [
      { id: "tecido", titulo: "Tecido", tipo: "card", opcoes: [{ id: "suede", label: "Suede", acrescimo: 0 }, { id: "couro", label: "Couro Natural", acrescimo: 1200 }] }
    ]
  },
  {
    id: "est-cad-jantar",
    nome: "Cadeira de Jantar Premium",
    skuBase: "CAD-PREM",
    descricao: "Madeira maciça Tauari.",
    imagem: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=600&q=80",
    tipoPrecificacao: "soma",
    precoBase: 450.00,
    variacoes: [
       { id: "cor", titulo: "Cor", tipo: "color", opcoes: [{ id: "bege", label: "Bege", hex: "#e5d0b1", acrescimo: 0 }, { id: "preto", label: "Preto", hex: "#111", acrescimo: 0 }] }
    ]
  },
  {
    id: "est-sofa-canto",
    nome: "Sofá de Canto Modular",
    skuBase: "CANTO-MOD",
    descricao: "Modular, adapta-se a qualquer sala.",
    imagem: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80",
    tipoPrecificacao: "soma",
    precoBase: 3200.00,
    variacoes: [{ id: "modulos", titulo: "Tamanho", tipo: "card", opcoes: [{ id: "2x2", label: "2x2m", acrescimo: 0 }, { id: "3x3", label: "3x3m", acrescimo: 1000 }] }]
  },
  {
    id: "est-puff-bau",
    nome: "Puff Baú Recamier",
    skuBase: "PUFF-BAU",
    imagem: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    tipoPrecificacao: "soma",
    precoBase: 450.00,
    variacoes: [{ id: "tecido", titulo: "Tecido", tipo: "card", opcoes: [{ id: "suede", label: "Suede", acrescimo: 0 }] }]
  }
];

// --- GERADOR DE PRODUTOS EXTRAS (Para encher o catálogo) ---
const gerarExtras = () => {
  const extras = [];
  const nomes = [
    "Sofá Living Tokyo", "Poltrona Opala", "Cabeceira Queen", "Recamier Imperial", 
    "Sofá Cama Prático", "Puff Decorativo Redondo", "Almofada Nó", "Tapete Belga",
    "Mesa de Centro Glass", "Aparador Rústico", "Banqueta Alta", "Poltrona Giratória",
    "Sofá Couro Legítimo", "Chaise Longue", "Divã Psicanálise"
  ];
  
  const imagens = [
    "https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1512212621149-107ffe53566e?auto=format&fit=crop&w=600&q=80"
  ];

  nomes.forEach((nome, index) => {
    extras.push({
      id: `extra-${index}`,
      nome: nome,
      skuBase: `SKU-${100 + index}`,
      descricao: "Produto disponível para encomenda imediata.",
      imagem: imagens[index % imagens.length], // Revezar imagens
      tipoPrecificacao: "soma",
      precoBase: 500 + (index * 150),
      variacoes: [
        { 
          id: "padrao", titulo: "Opções", tipo: "card", 
          opcoes: [{ id: "std", label: "Padrão", acrescimo: 0 }] 
        }
      ]
    });
  });
  
  return extras;
};

// Exporta a lista combinada (5 bases + 15 extras = 20 produtos)
export const produtosMock = [...produtosBase, ...gerarExtras()];

export const getProdutoById = (id) => produtosMock.find(p => p.id === id);