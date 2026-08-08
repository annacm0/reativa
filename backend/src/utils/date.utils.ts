// Motor de recuperação — cálculo de datas e classificação de status
//
// Estas funções implementam as regras de negócio centrais:
// "Quando um cliente deve retornar? Já passou do prazo?"

export type ReturnStatus = 'NORMAL' | 'PROXIMO' | 'ATRASADO';

// Janela (em dias) que define o período "PRÓXIMO" antes e depois da data prevista.
// Ex: se o retorno era esperado para dia 10, clientes entre dia 3 e dia 17
// são classificados como PRÓXIMO (janela de 7 dias para cada lado).
const PROXIMATE_WINDOW_DAYS = 7;

/**
 * Calcula a data prevista de retorno.
 *
 * Exemplo:
 *   Último banho: 10/07/2026
 *   Intervalo: 30 dias
 *   Retorno previsto: 09/08/2026
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
 * Zero = o retorno é hoje
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
 * Classifica o status de retorno de um cliente/pet.
 *
 * Regras:
 *   NORMAL   → mais de 7 dias para o retorno previsto
 *   PROXIMO  → entre -7 e +7 dias do retorno previsto (inclusive)
 *   ATRASADO → mais de 7 dias além do retorno previsto
 */
export function classifyReturnStatus(daysUntilReturn: number): ReturnStatus {
  if (daysUntilReturn > PROXIMATE_WINDOW_DAYS) {
    return 'NORMAL';
  }

  if (daysUntilReturn >= -PROXIMATE_WINDOW_DAYS) {
    return 'PROXIMO';
  }

  return 'ATRASADO';
}

/**
 * Função principal: dado o último atendimento e o intervalo do serviço,
 * retorna todas as informações de retorno calculadas.
 */
export function calculateReturnInfo(
  lastAppointmentDate: Date,
  returnIntervalDays: number
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
  const status = classifyReturnStatus(daysUntilReturn);

  return { expectedReturnDate, daysUntilReturn, status };
}
