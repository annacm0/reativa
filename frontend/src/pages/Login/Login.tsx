import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { loginSchema, type LoginFormData } from '../../schemas/auth.schema';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Alert } from '../../components/Alert/Alert';
import './Login.css';

// ──────────────────────────────────────────────────────────────────────────────
// Login — página de autenticação do Reativa
//
// Fluxo:
//   1. Usuário já autenticado → redireciona para /dashboard
//   2. Formulário validado por Zod (React Hook Form)
//   3. Submissão → chama auth.login() via useAuth()
//   4. Sucesso → redireciona para a rota original (state.from) ou /dashboard
//   5. Erro de API → exibe Alert com mensagem amigável
//
// Acessibilidade:
//   ✓ <form> com autocomplete="on" e noValidate (validação pelo Zod/JS)
//   ✓ Inputs com autocomplete e inputMode corretos
//   ✓ Campos desabilitados durante envio (evita submissão dupla)
//   ✓ Alert de erro com role="alert" (anunciado imediatamente)
//   ✓ Título da página atualizado via document.title
// ──────────────────────────────────────────────────────────────────────────────

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState<string | null>(null);

  // Atualiza o título da aba — importante para SEO e acessibilidade
  useEffect(() => {
    document.title = 'Entrar — Reativa';
    return () => {
      document.title = 'Reativa';
    };
  }, []);

  // Usuário já autenticado não precisa ver o login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    // Limpa erro anterior antes de nova tentativa
    setApiError(null);

    try {
      await login(data);

      // Redireciona para a rota que o usuário tentou acessar antes do login,
      // ou para /dashboard se veio diretamente para /login
      const from =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer login. Tente novamente.'
      );
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Marca — Link acessível para usuários que chegaram por engano */}
        <Link to="/login" className="auth-brand" aria-label="Reativa — página inicial">
          {/*
            Logo placeholder — substituir pelo <img> do logo definitivo quando disponível.
            Manter aria-hidden no elemento decorativo e um texto visível ao lado.
          */}
          <div className="auth-brand__mark" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="auth-brand__name">Reativa</span>
        </Link>

        {/* Cabeçalho — h1 único da página */}
        <div className="auth-header">
          <h1 className="auth-header__title">Bem-vindo de volta</h1>
          <p className="auth-header__subtitle">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        {/* Erro da API — aparece acima do formulário */}
        {apiError && (
          <Alert variant="error" className="auth-form__api-error">
            {apiError}
          </Alert>
        )}

        {/*
          noValidate: desativa validação nativa do browser — o Zod cuida disso.
          autocomplete="on": permite que o browser sugira email e senha salvos.
        */}
        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="on"
          noValidate
        >
          <Input
            label="Email"
            id="login-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="seu@email.com"
            disabled={isSubmitting}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <Input
            label="Senha"
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            disabled={isSubmitting}
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            disabled={!isValid || isSubmitting}
            className="auth-form__submit"
          >
            Entrar
          </Button>
        </form>

        <footer className="auth-footer">
          Não tem conta?{' '}
          <Link to="/register">Criar conta</Link>
        </footer>
      </div>
    </main>
  );
}
