
// Шаг: публикация контента (TZ §3.2 «Публикация контента»).
// Раскрывающиеся подробности (TZ §10.3) + отметка повышенной сложности.
import { Card, CardTitle, CardBody } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import type { ConstructorState } from '@/types';
import type { ConstructorSet } from '@/state/useConstructor';

export interface PublishingStepProps {
  state: ConstructorState;
  set: ConstructorSet;
  /** ID доступных публикационных интеграций. */
  availableChannels: string[];
  channelTitles: Record<string, string>;
}

export function PublishingStep({
  state,
  set,
  availableChannels,
  channelTitles,
}: PublishingStepProps) {
  // Расширенный сценарий = комментарии + статистика (TZ §3.2).
  const extended = state.publishComments || state.publishStats;
  return (
    <Card className="publishing-step">
      <CardTitle>Публикация контента</CardTitle>
      <CardBody>
        {availableChannels.length === 0 ? (
          <div className="publishing-empty">
            <p className="muted">
              Каналы появятся после выбора типа решения (шаг 1) — у каждого продукта свой набор
              публикационных интеграций.
            </p>
            <a className="reset-link" href="#step-product">
              ← Выбрать тип решения
            </a>
          </div>
        ) : (
          <Select
            id="publish-channel"
            label="Канал публикации"
            value={state.publishChannel ?? ''}
            placeholder="Не выбран"
            options={[
              { value: '', label: 'Не выбран' },
              ...availableChannels.map((id) => ({ value: id, label: channelTitles[id] ?? id })),
            ]}
            onChange={(v) => set('publishChannel', v || null)}
          />
        )}

        <div className="toggle-row">
          <Toggle
            id="pub-text"
            checked={state.publishText}
            onChange={() => set('publishText', !state.publishText)}
          />
          <label htmlFor="pub-text" className="option-label">Публикация текста</label>
        </div>

        <div className="toggle-row">
          <Toggle
            id="pub-image"
            checked={state.publishImage}
            onChange={() => set('publishImage', !state.publishImage)}
          />
          <label htmlFor="pub-image" className="option-label">Готовые изображения</label>
        </div>

        <div className="toggle-row">
          <Toggle
            id="pub-comments"
            checked={state.publishComments}
            onChange={() => set('publishComments', !state.publishComments)}
          />
          <label htmlFor="pub-comments" className="option-label">Работа с комментариями</label>
        </div>

        <div className="toggle-row">
          <Toggle
            id="pub-stats"
            checked={state.publishStats}
            onChange={() => set('publishStats', !state.publishStats)}
          />
          <label htmlFor="pub-stats" className="option-label">Сбор статистики</label>
        </div>

        {extended && (
          <div className="price-individual">
            <Badge tone="individual">Повышенная сложность</Badge>
            <p className="muted">
              Сценарий с комментариями и статистикой учитывается как услуга повышенной сложности
              и может потребовать индивидуального расчёта.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
