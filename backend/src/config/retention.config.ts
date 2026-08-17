/**
 * Configurações do Motor de Reativação
 *
 * RETURN_WINDOW_DAYS define a janela em dias antes do retorno previsto
 * que classifica um cliente como PROXIMO.
 *
 * Classificação atual (X = 7):
 *   NORMAL   → daysUntilReturn > X       (mais de 7 dias para o retorno)
 *   PROXIMO  → 0 <= daysUntilReturn <= X (de hoje até X dias, inclusive a data)
 *   ATRASADO → daysUntilReturn < 0       (qualquer dia após a data prevista)
 *
 * Para personalizar por empresa no futuro, basta passar o valor de
 * company.returnWindowDays (do banco) em vez desta constante — sem
 * alterar o motor de classificação.
 *
 * Exemplo futuro:
 *   const window = company.returnWindowDays ?? RETURN_WINDOW_DAYS;
 *   classifyReturnStatus(daysUntilReturn, window);
 */
export const RETURN_WINDOW_DAYS = 7;
