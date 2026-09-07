// Utilitário para geração de links do WhatsApp (wa.me)
//
// Não usamos a API oficial do WhatsApp no MVP.
// O link wa.me abre o WhatsApp com uma mensagem pré-preenchida.
// Formato: https://wa.me/<número>?text=<mensagem codificada>

/**
 * Normaliza um número de telefone para o formato internacional.
 * Remove todos os caracteres não numéricos e adiciona o DDI do Brasil (55)
 * se o número não começar com ele.
 *
 * Exemplos:
 *   "(11) 99999-9999"   → "5511999999999"
 *   "11999999999"       → "5511999999999"
 *   "+55 11 99999-9999" → "5511999999999"
 */
export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('55')) {
    return digits;
  }

  return `55${digits}`;
}

/**
 * Gera o link do WhatsApp com mensagem pré-preenchida.
 *
 * @param phone   - Número de telefone (qualquer formato)
 * @param message - Mensagem a ser pré-preenchida
 * @returns URL completa do WhatsApp (wa.me)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const normalizedPhone = normalizePhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/**
 * Gera a mensagem genérica de reativação.
 *
 * Funciona para qualquer segmento de negócio:
 *   "Olá, Ana! Já está próximo do período do seu Corte de Cabelo."
 *   "Olá, Carlos! Já está próximo do período da sua Troca de Óleo."
 *   "Olá, Lucia! Já está próximo do período da sua Consulta de Rotina."
 *
 * @param clientName  - Nome completo do cliente
 * @param serviceName - Nome do serviço (ex: "Banho", "Corte", "Troca de Óleo")
 */
export function generateRetentionMessage(
  clientName: string,
  serviceName: string
): string {
  // Pega apenas o primeiro nome para deixar a mensagem mais pessoal e informal
  const firstName = clientName.split(' ')[0];

  return (
    `Olá, ${firstName}! Tudo bem? 😊 ` +
    `Já está próximo do período habitual do seu ${serviceName}. ` +
    `Gostaria de agendar um horário?`
  );
}
