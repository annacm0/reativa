# Reativa

SaaS B2B para reativação de clientes recorrentes.

## O que é?

O Reativa ajuda pequenos negócios (pet shops, salões, clínicas) a identificar clientes próximos do período de retorno e facilitar o contato via WhatsApp.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Banco de dados | PostgreSQL + Prisma ORM |
| Autenticação | JWT (JSON Web Token) |

## Estrutura do projeto

```
Reativa/
├── frontend/     ← SPA React
├── backend/      ← API REST Node.js
├── prisma/       ← Esquema e migrations do banco
└── docs/         ← Documentação técnica
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) v20 ou superior
- [PostgreSQL](https://www.postgresql.org/) v14 ou superior
- npm v10 ou superior

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd Reativa
```

### 2. Configure as variáveis de ambiente

```bash
# Na raiz do projeto
cp .env.example .env
# Edite o .env com suas configurações locais
```

```bash
# No backend
cp backend/.env.example backend/.env
```

```bash
# No frontend
cp frontend/.env.example frontend/.env
```

### 3. Instale as dependências

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Configure o banco de dados

```bash
cd ../
npx prisma migrate dev --name init
```

### 5. Execute o projeto

Em dois terminais separados:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

O frontend estará disponível em: http://localhost:5173
O backend estará disponível em: http://localhost:3333

## Documentação

- [Arquitetura](./docs/architecture.md)
- [API](./docs/api.md)

## Etapas de desenvolvimento

- [x] ETAPA 1 — Arquitetura e estrutura de pastas
- [ ] ETAPA 2 — Configuração do projeto
- [ ] ETAPA 3 — Banco de dados e Prisma
- [ ] ETAPA 4 — Autenticação
- [ ] ETAPA 5 — Multi-tenancy
- [ ] ETAPA 6 — Clientes
- [ ] ETAPA 7 — Pets
- [ ] ETAPA 8 — Serviços
- [ ] ETAPA 9 — Atendimentos
- [ ] ETAPA 10 — Motor de recuperação
- [ ] ETAPA 11 — Dashboard
- [ ] ETAPA 12 — WhatsApp
- [ ] ETAPA 13 — Testes
- [ ] ETAPA 14 — Segurança e revisão
- [ ] ETAPA 15 — Deploy
