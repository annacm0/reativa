# API do Reativa

Base URL: `http://localhost:3333`

## Autenticação

Todas as rotas protegidas exigem o header:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/register
Cria uma nova empresa e usuário administrador.

**Body:**
```json
{
  "companyName": "Pet Shop da Ana",
  "name": "Ana Silva",
  "email": "ana@petshop.com",
  "password": "senha123"
}
```

**Resposta 201:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "name": "Ana Silva", "email": "ana@petshop.com" }
}
```

---

### POST /auth/login
Autentica um usuário existente.

**Body:**
```json
{
  "email": "ana@petshop.com",
  "password": "senha123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "name": "Ana Silva", "email": "ana@petshop.com" }
}
```

---

## Clientes

> Todas as rotas abaixo são protegidas.

### GET /clients
Lista todos os clientes da empresa autenticada.

### POST /clients
Cria um novo cliente.

**Body:**
```json
{
  "name": "Ana Silva",
  "phone": "11999999999",
  "email": "ana@email.com",
  "notes": "Observações livres sobre o cliente (opcional)"
}
```

### GET /clients/:id
Retorna um cliente pelo ID.

### PUT /clients/:id
Atualiza um cliente.

### DELETE /clients/:id
Remove um cliente.

---

## Serviços

### GET /services
Lista os serviços da empresa.

### POST /services
Cria um novo serviço.

### PUT /services/:id
Atualiza um serviço.

### DELETE /services/:id
Remove um serviço.

---

## Atendimentos

### GET /appointments
Lista os atendimentos da empresa.

### POST /appointments
Registra um novo atendimento.

### GET /appointments/:id
Retorna um atendimento pelo ID.

---

## Recuperação

### GET /retention
Retorna a lista de clientes classificados por status de retorno.

**Resposta 200:**
```json
[
  {
    "client": { "id": "uuid", "name": "Ana Silva", "phone": "11999999999" },
    "service": { "name": "Corte de Cabelo", "returnIntervalDays": 30 },
    "lastAppointmentDate": "2026-07-10T00:00:00.000Z",
    "expectedReturnDate": "2026-08-09T00:00:00.000Z",
    "daysUntilReturn": 1,
    "status": "PROXIMO",
    "whatsappLink": "https://wa.me/5511999999999?text=Ol%C3%A1%2C+Ana..."
  },
  {
    "client": { "id": "uuid", "name": "Carlos Souza", "phone": "11988888888" },
    "service": { "name": "Troca de Óleo", "returnIntervalDays": 90 },
    "lastAppointmentDate": "2026-05-10T00:00:00.000Z",
    "expectedReturnDate": "2026-08-08T00:00:00.000Z",
    "daysUntilReturn": -5,
    "status": "ATRASADO",
    "whatsappLink": "https://wa.me/5511988888888?text=Ol%C3%A1%2C+Carlos..."
  }
]
```

---

## Códigos de Resposta

| Código | Significado |
|--------|------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |
