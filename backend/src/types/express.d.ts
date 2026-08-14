// Estende os tipos do Express para incluir o campo 'user' em req.
// Preenchido pelo middleware authenticate após verificar o JWT.
//
// Em todo controller protegido, req.user estará disponível com segurança de tipos.
// REGRA: req.user.companyId e req.user.role vêm do token — nunca do body/params.

declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      companyId: string; // sempre da empresa autenticada, nunca do frontend
      role: 'ADMIN' | 'MEMBER';
    };
  }
}
