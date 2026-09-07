import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import { AppError } from './error.middleware';

/**
 * Middleware de autenticação — deve ser aplicado a todas as rotas protegidas.
 *
 * Fluxo:
 *   1. Lê o header Authorization: Bearer <token>
 *   2. Verifica e decodifica o JWT
 *   3. Popula req.user com { userId, companyId, role }
 *   4. Chama next() para continuar para o controller
 *
 * REGRA FUNDAMENTAL:
 *   req.user.companyId vem do token verificado pelo servidor.
 *   Nunca confiar em companyId enviado pelo frontend no body ou params.
 *   Qualquer controller que receber companyId deve ignorá-lo e usar req.user.companyId.
 *
 * Erros não expõem detalhes internos (token expirado, assinatura inválida, etc.)
 * — todos resultam em 401 genérico.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    // Valida presença e formato do header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    // Extrai o token (remove o prefixo "Bearer ")
    const token = authHeader.slice(7);

    // Verifica assinatura, expiração e estrutura do payload
    const payload = verifyToken(token);

    // Injeta dados do usuário autenticado na request
    // Disponível em todo controller que usar este middleware
    req.user = {
      userId: payload.userId,
      companyId: payload.companyId,
      role: payload.role,
    };

    next();
  } catch (err) {
    // AppError já formatado (ex: "Token não fornecido") → passa direto
    if (err instanceof AppError) {
      next(err);
      return;
    }
    // Qualquer outro erro do JWT (expired, invalid signature, etc.)
    // → mensagem genérica, sem revelar o motivo real
    next(new AppError('Token inválido ou expirado', 401));
  }
}
