import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Estrutura dos dados que ficam dentro do token
export interface JwtPayload {
  userId: string;
  companyId: string;
}

/**
 * Gera um token JWT com o userId e companyId do usuário.
 *
 * O companyId no token é a base do multi-tenancy:
 * o backend sempre usa ESSE valor, nunca o que vem do frontend.
 */
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifica e decodifica um token JWT.
 * Lança erro se o token for inválido ou expirado.
 */
export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  if (
    typeof decoded !== 'object' ||
    !decoded ||
    !('userId' in decoded) ||
    !('companyId' in decoded)
  ) {
    throw new Error('Token inválido: payload mal formado');
  }

  return decoded as JwtPayload;
}
