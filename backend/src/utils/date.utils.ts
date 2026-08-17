// Motor de recuperação — cálculo de datas e classificação de status
//
// Estas funções implementam as regras de negócio centrais:
// "Quando um cliente deve retornar? Já passou do prazo?"

import { RETURN_WINDOW_DAYS } from '../config/retention.config';

export type ReturnStatus = 'NORMAL' | 'PROXIMO' | 'ATRASADO';

/**
 * Calcula a data prevista de retorno.
 *
 * Exemplo (salão de beleza):
 *   Último corte: 10/07/2026
 *   Intervalo: 30 dias
 *   Retorno previsto: 09/08/2026
 *
 * Funciona para qualquer segmento: pet shop, clínica, oficina, etc.
 */
export function calculateExpectedReturnDate(
  lastAppointmentDate: Date,
  returnIntervalDays: number
): Date {
  const returnDate = new Date(lastAppointmentDate);
  returnDate.setDate(returnDate.getDate() + returnIntervalDays);
  return returnDate;
}

/**
 * Calcula quantos dias faltam (ou passaram) para o retorno previsto.
 *
 * Valor positivo = falta N dias para o retorno
 * Valor negativo = o retorno estava previsto há N dias (atrasado)
 * Zero           = o retorno é hoje
 */
export function calculateDaysUntilReturn(expectedReturnDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas datas

  const returnDate = new Date(expectedReturnDate);
  returnDate.setHours(0, 0, 0, 0);

  const diffMs = returnDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Verifica se uma data é estritamente futura em relação ao dia atual.
 *
 * Ambas as datas são normalizadas para meia-noite (setHours(0,0,0,0))
 * antes da comparação, eliminando qualquer dependência de horário ou
 * timezone do servidor. A comparação é puramente entre dias.
 *
 * Exemplos:
 *   hoje         → false (não é futuro)
 *   ontem        → false
 *   amanhã       → true
 *   23:59 de hoje → false (mesmo dia, mesmo que instante seja "futuro")
 *
 * Usada pelo schema de Appointment para garantir que a data representa
 * um atendimento já realizado, sem falso-positivo por timezone.
 */
export function isFutureDate(date: Date | string): boolean {
  // Calcula a string "YYYYMMDD" de hoje, sem dependência de timezone
  const now = new Date();
  const todayStr =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  if (typeof date === 'string') {
    // String "YYYY-MM-DD": remove hífens e compara lexicograficamente.
    // "20260818" > "20260817" → futuro. Sem conversão de timezone.
    const dateStr = date.replace(/-/g, '');
    return dateStr > todayStr;
  }

  // Date: extrai ano/mês/dia locais (mesma lógica, sem UTC)
  const dateStr =
    String(date.getFullYear()) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');

  return dateStr > todayStr;
}

/**
 * Classifica o status de retorno de um cliente.
 *
 * Regras (com windowDays = 7 como padrão do MVP):
 *   ATRASADO → daysUntilReturn < 0             (data prevista já passou)
 *   PROXIMO  → 0 <= daysUntilReturn <= windowDays (de hoje até X dias)
 *   NORMAL   → daysUntilReturn > windowDays    (mais de X dias para o retorno)
 *
 * @param daysUntilReturn - Dias até o retorno previsto (negativo = atrasado)
 * @param windowDays      - Janela de PROXIMO em dias (padrão: RETURN_WINDOW_DAYS)
 *                          Futuramente virá da configuração por empresa.
 */
export function classifyReturnStatus(
  daysUntilReturn: number,
  windowDays: number = RETURN_WINDOW_DAYS
): ReturnStatus {
  if (daysUntilReturn < 0) return 'ATRASADO';           // já passou a data prevista
  if (daysUntilReturn <= windowDays) return 'PROXIMO';  // de hoje até X dias
  return 'NORMAL';                                       // mais de X dias
}

/**
 * Função principal: dado o último atendimento, o intervalo do serviço
 * e a janela de PROXIMO, retorna todas as informações de retorno calculadas.
 *
 * @param lastAppointmentDate - Data do último atendimento
 * @param returnIntervalDays  - Intervalo esperado de retorno (em dias)
 * @param windowDays          - Janela de PROXIMO (padrão: RETURN_WINDOW_DAYS)
 */
export function calculateReturnInfo(
  lastAppointmentDate: Date,
  returnIntervalDays: number,
  windowDays: number = RETURN_WINDOW_DAYS
): {
  expectedReturnDate: Date;
  daysUntilReturn: number;
  status: ReturnStatus;
} {
  const expectedReturnDate = calculateExpectedReturnDate(
    lastAppointmentDate,
    returnIntervalDays
  );
  const daysUntilReturn = calculateDaysUntilReturn(expectedReturnDate);
  const status = classifyReturnStatus(daysUntilReturn, windowDays);

  return { expectedReturnDate, daysUntilReturn, status };
}
