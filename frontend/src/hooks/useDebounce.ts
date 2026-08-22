/**
 * useDebounce.ts — Hook genérico de debounce
 *
 * Retarda a atualização de um valor até que o usuário pare de digitar.
 * Usado na busca de clientes para evitar chamadas à API a cada tecla.
 *
 * @param value - Valor a ser debounced (qualquer tipo)
 * @param delay - Tempo de espera em ms antes de atualizar (default: 300)
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    // Cancela o timer anterior se value mudar antes de delay ms
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
