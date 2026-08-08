# Arquitetura do Reativa

## Visão Geral

O Reativa utiliza uma arquitetura em 3 camadas clássica, separando responsabilidades de forma clara:

```
[Navegador] ←→ [API REST] ←→ [Banco de Dados]
  React           Express       PostgreSQL
```

## Camadas do Backend

### Route (Rota)
- Define qual URL aceita qual método HTTP (`GET`, `POST`, etc.)
- Não contém lógica
- Apenas direciona para o Controller correto

### Controller (Controlador)
- Recebe a requisição HTTP (`req`)
- Extrai dados necessários (body, params, query)
- Chama o Service correspondente
- Retorna a resposta HTTP (`res`)
- Não contém regras de negócio
- Não acessa o banco diretamente

### Service (Serviço)
- **Contém as regras de negócio**
- Orquestra operações complexas
- Chama os Repositories para acessar dados
- Exemplo: calcular se um cliente está PRÓXIMO, NORMAL ou ATRASADO

### Repository (Repositório)
- Único ponto de acesso ao banco de dados
- Usa o Prisma ORM
- Não contém regras de negócio
- Apenas faz CRUD: Create, Read, Update, Delete

### Middleware
- Código executado **antes** de chegar ao Controller
- Exemplos: validar JWT, validar body com Zod, registrar logs

## Fluxo de Autenticação

```
1. POST /auth/login { email, password }
2. Backend verifica email no banco
3. Backend compara password com o hash armazenado (bcrypt)
4. Se válido: gera JWT com { userId, companyId }
5. Retorna o token para o frontend
6. Frontend armazena o token
7. Próximas requisições: Authorization: Bearer <token>
8. Middleware valida o token e injeta req.user = { userId, companyId }
```

## Multi-Tenancy

### O que é multi-tenancy?
É a capacidade de um único sistema servir múltiplos clientes (empresas) de forma isolada. Cada empresa vê apenas seus próprios dados.

### Como é implementado no Reativa

**Estratégia: Row-Level Isolation (Isolamento por Linha)**

Cada registro no banco possui um `companyId` que indica a qual empresa ele pertence.

```
Client { id, companyId, name, ... }
Service { id, companyId, name, ... }
Appointment { id, companyId, petId, serviceId, ... }
```

**Fluxo de proteção:**

```
Login
  ↓
JWT gerado com companyId
  ↓
Requisição com Bearer Token
  ↓
Middleware extrai companyId do token (NÃO do request body)
  ↓
req.user = { userId, companyId }
  ↓
Controller passa companyId para o Service
  ↓
Repository filtra: WHERE companyId = req.user.companyId
  ↓
Empresa A nunca vê dados da Empresa B ✅
```

**Regra de ouro:** O `companyId` NUNCA vem do frontend. Sempre do token JWT.

## Regras de Negócio do Motor de Recuperação

```typescript
// Janela configurável para status PRÓXIMO: 7 dias
const PROXIMATE_WINDOW_DAYS = 7;

function classifyReturnStatus(lastAppointmentDate: Date, returnIntervalDays: number): ReturnStatus {
  const expectedReturnDate = addDays(lastAppointmentDate, returnIntervalDays);
  const daysUntilReturn = differenceInDays(expectedReturnDate, today);

  if (daysUntilReturn > PROXIMATE_WINDOW_DAYS) return 'NORMAL';
  if (daysUntilReturn >= -PROXIMATE_WINDOW_DAYS) return 'PROXIMO';
  return 'ATRASADO';
}
```

| Status | Condição | Exemplo |
|--------|----------|---------|
| NORMAL | Mais de 7 dias para o retorno previsto | Retorno daqui 15 dias |
| PRÓXIMO | Entre -7 e +7 dias do retorno previsto | Retorno daqui 3 dias ou 5 dias atrás |
| ATRASADO | Mais de 7 dias além do retorno previsto | Retorno era há 10 dias |

## Segurança

| Mecanismo | Onde | Por quê |
|-----------|------|---------|
| bcrypt | hash.utils.ts | Senhas nunca armazenadas em texto puro |
| JWT | jwt.utils.ts | Autenticação stateless e segura |
| Zod | schemas/ | Validação de todas as entradas |
| Helmet | server.ts | Headers HTTP de segurança |
| CORS | config/cors.ts | Controla quais origens podem acessar a API |
| Rate Limiting | middlewares/ | Previne ataques de força bruta |
| Prisma ORM | repositories/ | Previne SQL Injection nativamente |
| companyId do JWT | auth.middleware.ts | Isolamento multi-tenant |

## Variáveis de Ambiente

Nunca coloque segredos no código. Use sempre variáveis de ambiente.

```
DATABASE_URL   → conexão com PostgreSQL
JWT_SECRET     → chave para assinar tokens
JWT_EXPIRES_IN → tempo de expiração do token
PORT           → porta do servidor
NODE_ENV       → development | production
FRONTEND_URL   → URL do frontend (para CORS)
VITE_API_URL   → URL da API (usado pelo frontend)
```
