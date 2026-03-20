/**
 * ============================================================
 *  HARD E-COMMERCE — server.js
 *  Backend Node.js + Express + PostgreSQL (node-postgres)
 * ============================================================
 *
 *  SETUP:
 *    npm install express pg cors dotenv helmet
 *    node server.js
 *
 *  .env:
 *    DATABASE_URL=postgresql://user:pass@host:5432/hard_ecommerce
 *    PORT=3001
 *    ADMIN_SECRET=sua-chave-secreta-aqui
 * ============================================================
 */

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors    = require("cors");
const helmet  = require("helmet");

const app  = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ── INICIALIZAR TABELA (migrations) ──────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS depoimentos (
      id         SERIAL PRIMARY KEY,
      nome       VARCHAR(120)  NOT NULL,
      empresa    VARCHAR(120),
      texto      TEXT          NOT NULL,
      resultado  VARCHAR(80),
      nota       SMALLINT      DEFAULT 5 CHECK (nota BETWEEN 1 AND 5),
      aprovado   BOOLEAN       DEFAULT TRUE,
      created_at TIMESTAMPTZ   DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_dep_aprovado ON depoimentos(aprovado);
  `);
  console.log("✅ Banco inicializado");
}

// ── MIDDLEWARE DE AUTENTICAÇÃO (admin) ────────────────────
function adminAuth(req, res, next) {
  const secret = req.headers["x-admin-secret"];
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
}

// ── VALIDAÇÃO ─────────────────────────────────────────────
function validarDep({ nome, texto, nota }) {
  const erros = [];
  if (!nome?.trim())  erros.push("Nome é obrigatório");
  if (!texto?.trim()) erros.push("Texto é obrigatório");
  if (nota && (nota < 1 || nota > 5)) erros.push("Nota deve ser entre 1 e 5");
  return erros;
}

// ── ROTAS ─────────────────────────────────────────────────

/**
 * GET /api/depoimentos
 * Retorna depoimentos aprovados (público)
 */
app.get("/api/depoimentos", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, nome, empresa, texto, resultado, nota, created_at
      FROM   depoimentos
      WHERE  aprovado = TRUE
      ORDER  BY created_at DESC
    `);
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/depoimentos
 * Cria novo depoimento (público — moderado depois)
 */
app.post("/api/depoimentos", async (req, res) => {
  const { nome, empresa, texto, resultado, nota = 5 } = req.body;
  const erros = validarDep({ nome, texto, nota });
  if (erros.length) return res.status(400).json({ errors: erros });

  try {
    const { rows } = await pool.query(`
      INSERT INTO depoimentos (nome, empresa, texto, resultado, nota)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [nome.trim(), empresa?.trim(), texto.trim(), resultado?.trim(), nota]);
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar depoimento" });
  }
});

/**
 * PATCH /api/depoimentos/:id  (admin)
 * Aprova ou reprova um depoimento
 */
app.patch("/api/depoimentos/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { aprovado } = req.body;

  try {
    const { rows } = await pool.query(`
      UPDATE depoimentos SET aprovado = $1 WHERE id = $2 RETURNING *
    `, [aprovado, id]);

    if (!rows.length) return res.status(404).json({ error: "Não encontrado" });
    res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});

/**
 * DELETE /api/depoimentos/:id  (admin)
 */
app.delete("/api/depoimentos/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM depoimentos WHERE id = $1", [id]
    );
    if (!rowCount) return res.status(404).json({ error: "Não encontrado" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

// ── GET /api/depoimentos (admin — todos, incluindo não aprovados) ──
app.get("/api/admin/depoimentos", adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM depoimentos ORDER BY created_at DESC"
    );
    res.json({ data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
});

// ── HEALTH CHECK ──────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── START ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Hard E-commerce API rodando na porta ${PORT}`);
  });
}).catch(err => {
  console.error("❌ Falha ao inicializar banco:", err);
  process.exit(1);
});
