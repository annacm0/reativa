import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

type Role = 'ADMIN' | 'MEMBER';

/**
 * Higher-order function que retorna um middleware de autorização.
 * Deve ser usado APÓS o middleware authenticate.
 *
 * Uso nas rotas:
 *   router.delete('/users/:id', authenticate, authorize('ADMIN'), controller.delete);
 *   router.get('/reports', authenticate, authorize('ADMIN', 'MEMBER'), controller.list);
 *
 * Aceita múltiplos roles — qualquer um deles autoriza o acesso.
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Garante que authenticate foi chamado antes (req.user deve existir)
    if (!req.user) {
      next(new AppError('Token de autenticação não fornecido', 401));
      return;
    }

    // Verifica se o role do usuário autenticado está na lista permitida
    if (!roles.includes(req.user.role)) {
      next(new AppError('Acesso negado: permissão insuficiente', 403));
      return;
    }

    next();
  };
}
