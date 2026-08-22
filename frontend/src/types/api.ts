// ──────────────────────────────────────────────────────────────────────────────
// types/api.ts — Tipos base para integração com a API do Reativa
//
// IMPORTANTE:
//   Esses tipos espelham as respostas do backend.
//   O frontend NÃO replica regras de negócio — apenas consome e exibe.
//
//   Regras críticas que pertencem ao backend:
//     - autenticação e autorização
//     - multi-tenancy (companyId vem sempre do token JWT)
//     - cálculo de status (NORMAL / PROXIMO / ATRASADO)
//     - motor de reativação
//     - geração do link WhatsApp
// ──────────────────────────────────────────────────────────────────────────────

/** Resposta de erro padrão da API */
export interface ApiError {
  error: string;
  /** Detalhes por campo — retornados pelo Zod em erros de validação */
  details?: Record<string, string[]>;
}

/** Resposta de autenticação (login e register) */
export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Usuário autenticado — mantido em memória via AuthContext (ETAPA 2) */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  /** companyId vem do token JWT — nunca do frontend */
  companyId: string;
}

/** Cliente */
export interface Client {
  id: string;
  name: string;
  /** Armazenado normalizado pelo backend: "5511999999999" */
  phone: string;
  /** null quando não informado — não enviar no body para omitir */
  email: string | null;
  /** null quando não informado — null no body para remover */
  notes: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

/** Serviço oferecido pela empresa */
export interface Service {
  id: string;
  name: string;
  /** Intervalo esperado de retorno em dias — base do motor de reativação */
  returnIntervalDays: number;
  /** Duração em minutos — informativo, opcional, reservado para agenda futura */
  durationMinutes: number | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

/** Atendimento realizado — registro histórico imutável */
export interface Appointment {
  id: string;
  /** Data do atendimento — nunca futura (validado pelo backend) */
  date: string;
  notes?: string;
  clientId: string;
  serviceId: string;
  companyId: string;
  /** Dados do cliente aninhados na resposta */
  client: Pick<Client, 'id' | 'name'>;
  /** Dados do serviço aninhados na resposta */
  service: Pick<Service, 'id' | 'name' | 'returnIntervalDays'>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status de reativação — classificado pelo backend.
 *
 * NORMAL   → mais de 7 dias para o retorno previsto
 * PROXIMO  → 0 a 7 dias para o retorno (inclusive a data prevista)
 * ATRASADO → passou da data prevista de retorno
 *
 * O frontend apenas exibe — nunca calcula esse status.
 */
export type ReturnStatus = 'NORMAL' | 'PROXIMO' | 'ATRASADO';

/** Entrada do motor de reativação — resultado por par (cliente + serviço) */
export interface RetentionEntry {
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  returnIntervalDays: number;
  lastAppointmentDate: string;
  expectedReturnDate: string;
  daysUntilReturn: number;
  status: ReturnStatus;
  /** Link wa.me com mensagem personalizada — gerado pelo backend */
  whatsappLink: string;
}
