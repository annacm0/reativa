import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { registerSchema, type RegisterFormData } from '../../schemas/auth.schema';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Alert } from '../../components/Alert/Alert';
import './Register.css';

// ──────────────────────────────────────────────────────────────────────────────
// Register — página de cadastro de empresa + primeiro usuário
//
// Fluxo:
//   1. Usuário já autenticado → redireciona para /dashboard
//   2. Formulário validado por Zod (React Hook Form)
//   3. Submissão → extrai confirmPassword (não enviada ao backend)
//   4. Chama auth.register() via useAuth() com os campos corretos
//   5. Sucesso → redireciona para /dashboard (logado automaticamente)
//   6. Erro de API → exibe Alert com mensagem amigável
//
// Campos enviados ao backend: companyName, segment?, name, email, password
// companyId NÃO é enviado — o backend cria e associa automaticamente.
//
// Segmento é opcional e agnóstico: pet shop, salão, clínica, etc.
// Placeholder sugere exemplos sem restringir o sistema a um nicho.
// ──────────────────────────────────────────────────────────────────────────────

export default function Register() {
  const { register: authRegister, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  // Atualiza o título da aba
  useEffect(() => {
    document.title = 'Criar conta — Reativa';
    return () => {
      document.title = 'Reativa';
    };
  }, []);

  // Usuário já autenticado → vai para o dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (formData: RegisterFormData) => {
    setApiError(null);

    // confirmPassword é validação de UX — não enviado ao backend
    // segment vazio → undefined (o backend trata como campo opcional)
    const { confirmPassword, segment, ...rest } = formData;
    void confirmPassword; // suprime warning de variável não usada

    const data = {
      ...rest,
      segment: segment?.trim() || undefined,
    };

    try {
      await authRegister(data);
      // Após cadastro, o usuário já está logado (token recebido da API)
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setApiError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar sua conta. Tente novamente.'
      );
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card--register">
        {/* Marca */}
        <Link to="/login" className="auth-brand" aria-label="Reativa — voltar ao login">
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
          <h1 className="auth-header__title">Criar conta</h1>
          <p className="auth-header__subtitle">
            Preencha os dados da sua empresa para começar
          </p>
        </div>

        {/* Erro da API */}
        {apiError && (
          <Alert variant="error">
            {apiError}
          </Alert>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="on"
          noValidate
        >
          {/* ── Seção: Sobre sua empresa ──────────────────────────────────── */}
          <section className="auth-form__section">
            {/*
              O <legend> semântico seria dentro de <fieldset>, mas o design
              com linha separadora fica mais limpo com a abordagem de rótulo visual.
              Usuários de teclado navegam pelos inputs, que têm labels próprios.
            */}
            <p className="auth-form__section-label" aria-hidden="true">
              Sobre sua empresa
            </p>

            <Input
              label="Nome da empresa"
              id="register-company-name"
              type="text"
              autoComplete="organization"
              placeholder="Ex: Clínica Bem Estar, Pet Shop Aurora…"
              disabled={isSubmitting}
              error={errors.companyName?.message}
              required
              {...register('companyName')}
            />

            <Input
              label="Segmento"
              id="register-segment"
              type="text"
              autoComplete="off"
              placeholder="Ex: Pet shop, Salão, Clínica, Barbearia…"
              hint="Opcional — ajuda a personalizar sua experiência"
              disabled={isSubmitting}
              error={errors.segment?.message}
              {...register('segment')}
            />
          </section>

          {/* ── Seção: Sobre você ─────────────────────────────────────────── */}
          <section className="auth-form__section">
            <p className="auth-form__section-label" aria-hidden="true">
              Sobre você
            </p>

            <Input
              label="Seu nome"
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="Nome completo"
              disabled={isSubmitting}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Email"
              id="register-email"
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
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              hint="Use pelo menos 8 caracteres"
              disabled={isSubmitting}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Input
              label="Confirmar senha"
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repita sua senha"
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />
          </section>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="auth-form__submit"
          >
            Criar conta
          </Button>
        </form>

        <footer className="auth-footer">
          Já tem conta?{' '}
          <Link to="/login">Entrar</Link>
        </footer>
      </div>
    </main>
  );
}
