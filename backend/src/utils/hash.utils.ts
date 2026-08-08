import bcrypt from 'bcryptjs';

// Número de rounds do bcrypt.
// Cada round dobra o custo computacional.
// 12 rounds ≈ 300ms — bom equilíbrio entre segurança e performance.
const SALT_ROUNDS = 12;

/**
 * Gera o hash de uma senha.
 * NUNCA armazene a senha original — sempre o hash.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto puro com um hash armazenado.
 * Retorna true se a senha corresponde ao hash, false caso contrário.
 *
 * bcrypt.compare é seguro contra timing attacks — sempre leva
 * o mesmo tempo independente de onde a comparação falha.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
