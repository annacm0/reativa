import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import * as authService from './auth.service';

// ──────────────────────────────────────────────────────────────
// O controller é responsável apenas pela camada HTTP:
//   1. Ler e validar os dados da request (Zod)
//   2. Chamar o service com os dados validados
//   3. Retornar a resposta HTTP adequada
//   4. Passar erros ao error middleware via next(err)
//
// O controller NÃO conhece banco de dados nem regras de negócio.
// ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Cria uma nova empresa com seu primeiro usuário administrador.
 * Retorna 201 Created com token JWT e dados públicos do usuário.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Zod lança ZodError se os dados forem inválidos
    // O errorMiddleware captura e retorna 400 com os detalhes dos campos
    const data = registerSchema.parse(req.body);

    const result = await authService.register(data);

    res.status(201).json(result);
  } catch (err) {
    next(err); // Passa para o errorMiddleware
  }
}

/**
 * POST /api/auth/login
 * Autentica um usuário existente.
 * Retorna 200 OK com token JWT e dados públicos do usuário.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const result = await authService.login(data);

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
