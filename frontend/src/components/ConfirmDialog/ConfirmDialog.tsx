/**
 * ConfirmDialog.tsx — Modal de confirmação usando <dialog> nativo HTML5
 *
 * Por que <dialog> nativo?
 *   ✓ Sem dependência de biblioteca
 *   ✓ Focus trap automático (browser gerencia)
 *   ✓ Fechamento com Escape (comportamento nativo)
 *   ✓ Backdrop nativo via ::backdrop pseudo-element
 *   ✓ Accessibilidade: landmark "dialog" detectado por leitores de tela
 *
 * Acessibilidade:
 *   ✓ role="alertdialog" — mais urgente que "dialog" para confirmações destrutivas
 *   ✓ aria-labelledby aponta para o título
 *   ✓ aria-describedby aponta para a descrição
 *   ✓ Foco movido automaticamente pelo showModal()
 *   ✓ Escape fecha o dialog (nativo)
 *   ✓ Botão de cancelar é o primeiro no DOM mas visualmente último em desktop
 */

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../Button/Button';
import './ConfirmDialog.css';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Abre/fecha o <dialog> nativo via showModal()/close()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Sincroniza fechamento nativo (Escape) com o estado do componente pai
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      // O <dialog> fechou (ex: Escape) — notifica o pai para atualizar o estado
      if (!isLoading) onCancel();
    };

    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onCancel, isLoading]);

  // Previne fechamento por Escape durante ação em andamento
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      if (isLoading) e.preventDefault();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [isLoading]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      aria-modal="true"
    >
      <div className="confirm-dialog__content">
        {/* Ícone visual — aria-hidden porque o título e descrição já comunicam */}
        <div
          className={`confirm-dialog__icon confirm-dialog__icon--${variant}`}
          aria-hidden="true"
        >
          <AlertTriangle size={22} strokeWidth={2} />
        </div>

        <div className="confirm-dialog__body">
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>
          <p id="confirm-dialog-description" className="confirm-dialog__description">
            {description}
          </p>
        </div>

        <div className="confirm-dialog__actions">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
            type="button"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
