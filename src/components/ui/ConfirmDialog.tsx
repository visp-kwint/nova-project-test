
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Текст описания действия — обезличенный, без ПДн. */
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Диалог подтверждения в стиле NOVA (замена window.confirm, TZ §10.3).
 * Только существующие токены и классы (ui-btn, --bg-surface, --color-slate-mid):
 * Esc и клик по фону закрывают, фокус на отмене, скролл подложки блокируется.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const restoredRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoredRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      restoredRef.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="nova-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="nova-modal" role="dialog" aria-modal="true" aria-labelledby="nova-modal-title">
        <h2 id="nova-modal-title" className="nova-modal-title">
          {title}
        </h2>
        {description ? <p className="nova-modal-body">{description}</p> : null}
        <div className="nova-modal-actions">
          <button
            type="button"
            className="ui-btn ui-btn-ghost"
            ref={cancelRef}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
