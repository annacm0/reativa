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
 *   "(11) 99999-9999"  → "5511999999999"
 *   "11999999999"      → "5511999999999"
 *   "+55 11 99999-9999" → "5511999999999"
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove tudo que não é dígito
  const digits = phone.replace(/\D/g, '');

  // Adiciona o DDI do Brasil (55) se ainda não tiver
  if (digits.startsWith('55')) {
    return digits;
  }

  return `55${digits}`;
}

/**
 * Gera o link do WhatsApp com mensagem pré-preenchida.
 *
 * @param phone - Número de telefone (qualquer formato)
 * @param message - Mensagem a ser pré-preenchida
 * @returns URL completa do WhatsApp (wa.me)
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const normalizedPhone = normalizePhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

/**
 * Gera a mensagem personalizada de reativação.
 *
 * @param clientName - Nome do cliente (responsável)
 * @param petName - Nome do pet
 * @param serviceName - Nome do serviço (ex: "Banho")
 */
export function generateRetentionMessage(
  clientName: string,
  petName: string,
  serviceName: string
): string {
  // Pega apenas o primeiro nome para deixar mais informal
  const firstName = clientName.split(' ')[0];

  return (
    `Olá, ${firstName}! Tudo bem? 😊 ` +
    `Já está próximo do período habitual do próximo ${serviceName.toLowerCase()} da ${petName}. ` +
    `Gostaria de verificar um horário?`
  );
}
