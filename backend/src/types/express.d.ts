// Este arquivo estende os tipos do Express para incluir o campo 'user'
// que é injetado pelo middleware de autenticação.
//
// Após o middleware de auth processar o token JWT, qualquer controller
// pode acessar req.user.userId e req.user.companyId com segurança de tipos.

declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      companyId: string;
    };
  }
}
