import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

// Classe base para erros operacionais da aplicação (ex: "Cliente não encontrado")
// Esses erros são esperados e têm uma mensagem amigável para o usuário.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Necessário para que instanceof AppError funcione corretamente
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Middleware de tratamento de erros do Express
// Deve ser o ÚLTIMO middleware registrado na aplicação (4 parâmetros obrigatórios)
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Erro de validação do Zod (dados inválidos enviados pelo cliente) ──
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // ── Erro operacional (lançado intencionalmente pela aplicação) ──
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // ── Erro inesperado (bug, falha de banco, etc.) ──
  // Em desenvolvimento: mostra a stack trace para facilitar o debug
  // Em produção: mensagem genérica (nunca expõe detalhes internos)
  console.error('Erro inesperado:', err);

  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
