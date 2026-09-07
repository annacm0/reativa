import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Estrutura dos dados que ficam dentro do token JWT.
// Contém apenas o necessário para identificar o usuário e sua empresa.
// NUNCA incluir senha ou dados sensíveis aqui.
export interface JwtPayload {
  userId: string;
  companyId: string; // ← chave do multi-tenancy: sempre extraído do token, nunca do frontend
  role: 'ADMIN' | 'MEMBER';
}

/**
 * Gera um token JWT assinado com JWT_SECRET.
 * O payload (userId, companyId, role) é a única fonte de verdade
 * para identificar empresa e permissões em rotas protegidas.
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifica e decodifica um token JWT.
 * Lança erro se o token for inválido, expirado ou mal formado.
 * O caller deve tratar o erro e retornar 401 ao cliente.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== 'object' ||
    !decoded ||
    !('userId' in decoded) ||
    !('companyId' in decoded) ||
    !('role' in decoded)
  ) {
    throw new Error('Token inválido: payload mal formado');
  }

  return decoded as JwtPayload;
}
