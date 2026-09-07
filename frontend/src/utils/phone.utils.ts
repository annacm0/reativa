/**
 * phone.utils.ts — Utilitários de formatação de telefone para exibição
 *
 * RESPONSABILIDADES AQUI:
 *   ✓ Formatar para exibição na listagem/detalhe (normalizado → legível)
 *   ✓ Formatar durante a entrada do usuário (UX, sem biblioteca)
 *
 * RESPONSABILIDADES DO BACKEND:
 *   ✓ Normalização definitiva: "(11) 99999-9999" → "5511999999999"
 *   ✓ Validação de regra de negócio
 *   ✓ Persistência
 *
 * O frontend NÃO replica a normalização do backend.
 * Envia o telefone exatamente como o usuário digitou.
 * O Zod garante apenas que há ≥ 10 dígitos (DDD + número).
 */

/**
 * Formata um número normalizado para exibição legível ao usuário.
 *
 * Entrada esperada: número normalizado pelo backend (ex: "5511999999999")
 * Retorna: formato brasileiro legível (ex: "(11) 99999-9999")
 *
 * Suporta:
 *   - Celular (11 dígitos locais): (11) 99999-9999
 *   - Fixo (10 dígitos locais):    (11) 9999-9999
 *   - Sem DDI 55:                  ambos os casos acima
 *   - Fallback: retorna o valor original se não reconhecer o formato
 *
 * @param phone - Número normalizado pelo backend (ex: "5511999999999")
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';

  // Remove tudo que não for dígito
  const digits = phone.replace(/\D/g, '');

  // Remove o DDI 55 se presente
  const local = digits.startsWith('55') ? digits.slice(2) : digits;

  if (local.length === 11) {
    // Celular: (DDD) 9XXXX-XXXX
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }

  if (local.length === 10) {
    // Fixo: (DDD) XXXX-XXXX
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }

  // Formato não reconhecido — retorna original sem modificar
  return phone;
}

/**
 * Aplica formatação visual progressiva durante a digitação do telefone.
 * Não é máscara rígida — permite que o usuário apague/corrija livremente.
 *
 * Comportamento por quantidade de dígitos inseridos:
 *   0-2:   somente dígitos
 *   3-6:   (DD) início do número
 *   7-10:  (DD) XXXX-XXXX  (fixo ou celular começando a digitar)
 *   11:    (DD) XXXXX-XXXX (celular completo)
 *
 * Limita em 11 dígitos (máximo celular brasileiro sem DDI).
 * O backend aceita com ou sem formatação — essa função é apenas UX.
 *
 * @param value - Valor atual do input (pode ter formatação parcial)
 */
export function formatPhoneInput(value: string): string {
  // Extrai somente dígitos e limita ao máximo de 11 (celular BR sem DDI)
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // 11 dígitos: celular
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
