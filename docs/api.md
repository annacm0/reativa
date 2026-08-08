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

### GET /clients/:id
Retorna um cliente pelo ID.

### PUT /clients/:id
Atualiza um cliente.

### DELETE /clients/:id
Remove um cliente.

---

## Pets

### GET /pets
Lista todos os pets da empresa autenticada.

### POST /pets
Cria um novo pet vinculado a um cliente.

### GET /pets/:id
Retorna um pet pelo ID.

### PUT /pets/:id
Atualiza um pet.

### DELETE /pets/:id
Remove um pet.

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
    "pet": { "id": "uuid", "name": "Mel", "species": "Cão" },
    "client": { "id": "uuid", "name": "Ana Silva", "phone": "11999999999" },
    "service": { "name": "Banho", "returnIntervalDays": 30 },
    "lastAppointmentDate": "2026-07-10T00:00:00.000Z",
    "expectedReturnDate": "2026-08-09T00:00:00.000Z",
    "daysUntilReturn": 1,
    "status": "PROXIMO"
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
