/**
 * ============================================================
 *  HARD E-COMMERCE — API DE DEPOIMENTOS
 *  api.js — Camada de API com simulação de banco PostgreSQL
 * ============================================================
 *
 *  PRODUÇÃO — Para deploy real, substitua este arquivo por um
 *  servidor Node.js/Express com pg (node-postgres) e as rotas
 *  abaixo conectadas a um banco PostgreSQL real.
 *
 *  SCHEMA PostgreSQL (execute no banco):
 * ──────────────────────────────────────
 *  CREATE TABLE depoimentos (
 *    id         SERIAL PRIMARY KEY,
 *    nome       VARCHAR(120)  NOT NULL,
 *    empresa    VARCHAR(120),
 *    texto      TEXT          NOT NULL,
 *    resultado  VARCHAR(80),
 *    nota       SMALLINT      DEFAULT 5 CHECK (nota BETWEEN 1 AND 5),
 *    aprovado   BOOLEAN       DEFAULT TRUE,
 *    created_at TIMESTAMPTZ   DEFAULT NOW()
 *  );
 *
 *  CREATE INDEX idx_dep_aprovado ON depoimentos(aprovado);
 *
 *  API REST (Node/Express + pg):
 * ──────────────────────────────
 *  GET    /api/depoimentos          → lista aprovados
 *  POST   /api/depoimentos          → cria novo
 *  PATCH  /api/depoimentos/:id      → aprova/reprova
 *  DELETE /api/depoimentos/:id      → remove
 *
 * ============================================================
 */

const HardAPI = (() => {

  // Seed de dados iniciais (simulando SELECT do PostgreSQL)
  const _seed = [
    {
      id: 1,
      nome: "Mariana Costa",
      empresa: "Moda Feminina Online",
      texto: "Em 3 meses a Hard E-commerce triplicou nosso faturamento. Os relatórios são transparentes e a equipe responde qualquer dúvida na hora. Nunca vi uma agência tão comprometida com resultado.",
      resultado: "+340% de faturamento",
      nota: 5,
      aprovado: true,
      created_at: "2025-11-15T10:00:00Z"
    },
    {
      id: 2,
      nome: "Rafael Mendonça",
      empresa: "Suplementos & Saúde",
      texto: "Chegamos na Hard com ROAS de 2x e em 60 dias estávamos em 9x. A estratégia de Meta Ads com criativos novos toda semana fez toda diferença. Recomendo sem pensar duas vezes.",
      resultado: "ROAS de 2x para 9x",
      nota: 5,
      aprovado: true,
      created_at: "2025-12-02T14:30:00Z"
    },
    {
      id: 3,
      nome: "Fernanda Alves",
      empresa: "Casa & Decoração",
      texto: "O diferencial é que eles entendem o produto antes de anunciar. Nosso nicho é muito específico e a equipe personalizou toda a estratégia. Resultado: primeiro mês com 6 dígitos de faturamento.",
      resultado: "Primeiro mês 6 dígitos",
      nota: 5,
      aprovado: true,
      created_at: "2026-01-10T09:15:00Z"
    },
    {
      id: 4,
      nome: "Lucas Teixeira",
      empresa: "E-commerce de Eletrônicos",
      texto: "Black Friday foi um sucesso absurdo. 12x de ROAS com budget de R$50k. A gestão em tempo real durante o evento foi impressionante — estavam online às 2 da manhã otimizando campanhas.",
      resultado: "12x ROAS na Black Friday",
      nota: 5,
      aprovado: true,
      created_at: "2025-12-05T11:00:00Z"
    },
    {
      id: 5,
      nome: "Camila Borges",
      empresa: "Infoprodutos & Cursos",
      texto: "Reduziram meu CPL em 58% mantendo o mesmo volume de leads. Agora consigo escalar com previsibilidade. A transparência nos relatórios e a velocidade de resposta são incomparáveis.",
      resultado: "-58% no CPL",
      nota: 5,
      aprovado: true,
      created_at: "2026-02-18T16:45:00Z"
    },
    {
      id: 6,
      nome: "Bruno Carvalho",
      empresa: "Pet Shop Online",
      texto: "Tentei duas agências antes da Hard. Nenhuma entregou o que prometeu. Aqui, desde o primeiro mês os números vieram. Hoje tenho meta arrojada e a equipe me acompanha passo a passo.",
      resultado: "+180% em vendas mensais",
      nota: 5,
      aprovado: true,
      created_at: "2026-03-01T08:20:00Z"
    }
  ];

  // "Banco" em memória (simula tabela PostgreSQL)
  let _db = [..._seed];
  let _nextId = _db.length + 1;

  // Simula latência de rede/banco
  const _delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

  return {
    /**
     * GET /api/depoimentos
     * Retorna depoimentos aprovados, ordenados por data
     */
    async listar() {
      await _delay(350);
      return _db
        .filter(d => d.aprovado)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    /**
     * POST /api/depoimentos
     * Insere novo depoimento (aprovado por padrão neste demo)
     */
    async criar({ nome, empresa, texto, resultado, nota }) {
      await _delay(500);

      // Validação (espelharia constraints do PostgreSQL)
      if (!nome?.trim()) throw new Error("Nome é obrigatório");
      if (!texto?.trim()) throw new Error("Depoimento é obrigatório");
      if (nota < 1 || nota > 5) throw new Error("Nota deve ser entre 1 e 5");

      const novo = {
        id: _nextId++,
        nome: nome.trim(),
        empresa: empresa?.trim() || "",
        texto: texto.trim(),
        resultado: resultado?.trim() || "",
        nota: Number(nota) || 5,
        aprovado: true,
        created_at: new Date().toISOString()
      };

      _db.unshift(novo);
      return novo;
    },

    /**
     * DELETE /api/depoimentos/:id
     * Remove pelo ID
     */
    async deletar(id) {
      await _delay(300);
      const idx = _db.findIndex(d => d.id === id);
      if (idx === -1) throw new Error("Depoimento não encontrado");
      _db.splice(idx, 1);
      return { ok: true };
    }
  };
})();

// Exporta globalmente para uso no app.js
window.HardAPI = HardAPI;
