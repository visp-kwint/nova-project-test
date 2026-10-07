
// Форма заявки (TZ §3.5, §16). Валидация через zod (TZ §10.3).
// П.10: двухколоночная вёрстка — слева форма, справа итоговая конфигурация.
import { useState } from 'react';
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { track } from '@/domain/analytics/track';
import { api } from '@/api/client';
import { validateLead, type LeadData } from '@/domain/validation/validate';
import type { ConstructorState } from '@/types';

export interface LeadFormProps {
  state: ConstructorState;
  /** Обезличенный набор настроек для backend (без ПДн). */
  configSummary: string;
  /** Строки итоговой конфигурации (показываются справа, п.10). */
  configLines: string[];
}

type Status = 'idle' | 'submitting' | 'done' | 'error';

export function LeadForm({ state, configSummary, configLines }: LeadFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');

  const start = () => {
    if (status === 'idle') track('lead_form_started');
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    start();
    const form = new FormData(e.currentTarget);
    const str = (v: FormDataEntryValue | null) => (v === null ? '' : String(v));
    const lead: LeadData = {
      contactName: str(form.get('contactName')),
      email: str(form.get('email')),
      phone: str(form.get('phone')),
      company: str(form.get('company')),
      message: str(form.get('message')),
    };
    const result = validateLead(lead);
    if (!result.ok) {
      setErrors(result.errors);
      track('validation_error', { fields: Object.keys(result.errors).length });
      return;
    }
    setErrors({});
    setStatus('submitting');
    try {
      await api.submitLead({
        data: lead,
        state,
      });
      setStatus('done');
      track('lead_submitted');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="lead-layout">
      <Card className="lead-form">
        <CardTitle>Оставить заявку</CardTitle>
        <CardBody>
          {status === 'done' ? (
            <p className="lead-success">
              Заявка принята. Менеджер свяжется с вами и пришлёт коммерческое предложение.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="lead-fields">
              <Field label="Имя *" error={errors.contactName}>
                <input
                  name="contactName"
                  className="field-input"
                  onFocus={start}
                  placeholder="Ваше имя"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </Field>
              <Field label="E-mail *" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  className="field-input"
                  onFocus={start}
                  placeholder="you@company.com"
                  required
                />
              </Field>
              <Field label="Телефон" error={errors.phone}>
                <input
                  name="phone"
                  type="tel"
                  className="field-input"
                  onFocus={start}
                  placeholder="+7 000 000 00 00"
                />
              </Field>
              <Field label="Компания" error={errors.company}>
                <input
                  name="company"
                  className="field-input"
                  onFocus={start}
                  placeholder="Название компании"
                  maxLength={120}
                />
              </Field>
              <Field label="Комментарий" error={errors.message}>
                <textarea
                  name="message"
                  className="field-textarea"
                  rows={3}
                  onFocus={start}
                  maxLength={2000}
                  placeholder="Дополнительно о задаче"
                />
              </Field>
              {status === 'error' ? (
                <p className="lead-error">Не удалось отправить. Попробуйте позже.</p>
              ) : null}
              <Button type="submit" variant="primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Отправляем…' : 'Отправить заявку'}
              </Button>
              <p className="field-note">{configSummary}</p>
            </form>
          )}
        </CardBody>
      </Card>

      {/* Итоговая конфигурация справа (п.10) */}
      <div className="lead-aside">
        <Card className="final-config">
          <CardTitle>Итоговая конфигурация</CardTitle>
          <CardBody>
            <ul className="config-lines">
              {configLines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            <p className="field-note">
              Все цены предварительные. Менеджер подтвердит стоимость и сроки в коммерческом
              предложении.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  );
}
