# Hard E-commerce — Site Institucional

## 📁 Estrutura do Projeto

```
hard-ecommerce/
├── index.html       ← Frontend principal
├── style.css        ← Design system completo
├── api.js           ← API mock (browser) com documentação PostgreSQL
├── app.js           ← Lógica frontend (depoimentos, interações)
├── server.js        ← Backend Node.js + Express + PostgreSQL (produção)
├── package.json     ← Dependências do backend
└── README.md
```

---

## 🌐 Rodar o Frontend (sem backend)

Abra o `index.html` diretamente no navegador.
A API de depoimentos usa `api.js` como mock em memória — totalmente funcional no browser.

---

## 🚀 Rodar o Backend (PostgreSQL real)

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL 14+

### 2. Instalar dependências
```bash
npm install
```

### 3. Criar o `.env`
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/hard_ecommerce
PORT=3001
ADMIN_SECRET=sua-chave-secreta-aqui
FRONTEND_URL=http://localhost:3000
```

### 4. Criar o banco
```sql
CREATE DATABASE hard_ecommerce;
```
> As tabelas são criadas automaticamente ao iniciar o servidor.

### 5. Iniciar
```bash
npm start        # produção
npm run dev      # desenvolvimento (hot reload)
```

---

## 🔌 API REST

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/depoimentos` | — | Lista depoimentos aprovados |
| POST | `/api/depoimentos` | — | Cria novo depoimento |
| PATCH | `/api/depoimentos/:id` | Admin | Aprova/reprova depoimento |
| DELETE | `/api/depoimentos/:id` | Admin | Remove depoimento |
| GET | `/api/admin/depoimentos` | Admin | Lista todos (incluindo não aprovados) |
| GET | `/health` | — | Health check |

### Auth Admin
Passe o header `x-admin-secret: sua-chave-secreta` nas rotas protegidas.

---

## 📱 WhatsApp
Substitua o número `5521999999999` pelo número real da empresa em:
- `index.html` — todos os links `wa.me`

---

## 🎨 Design
Inspirado na estética do site O Primo Rico: dark premium, tipografia bold, grid editorial, paleta amarelo-ouro sobre fundo quase preto.

Fontes: **Bebas Neue** (display) + **Syne** (headings) + **DM Sans** (body)
