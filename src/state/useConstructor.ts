
// Стейт конструктора. TZ §10.2: пересчёт при каждом изменении +
// восстановление после обновления страницы (черновик в localStorage).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConstructorState } from '@/types';
import { loadDraft, saveDraft, clearDraft, DEFAULT_STATE } from '@/domain/draft/storage';
import { track } from '@/domain/analytics/track';
import { api } from '@/api/client';

export interface ConstructorSet {
  <K extends keyof ConstructorState>(key: K, value: ConstructorState[K]): void;
}

export interface UseConstructor {
  state: ConstructorState;
  set: ConstructorSet;
  toggleFeature: (id: string) => void;
  toggleIntegration: (id: string) => void;
  /** Смена продукта с prune несовместимых функций/интеграций (TZ §10.2, §16). */
  selectProduct: (
    id: string,
    allowed: { features: readonly string[]; integrations: readonly string[] },
  ) => void;
  reset: () => void;
  isPristine: boolean;
}

export function useConstructor(): UseConstructor {
  const [state, setState] = useState<ConstructorState>(() => loadDraft());

  // TZ §13: восстановление серверного черновика (GET /api/construct/draft/{id}).
  // Только если локальный черновик «чистый» — не перебиваем свежую локальную
  // работу; в mock (dev) серверное хранилище пусто — молча пропускаем.
  const serverDraftTried = useRef(false);
  useEffect(() => {
    if (serverDraftTried.current) return;
    serverDraftTried.current = true;
    // Локальный черновик «грязный» — у пользователя свежая работа,
    // не перебиваем её. Чистый — пробуем серверный.
    if (JSON.stringify(state) !== JSON.stringify(DEFAULT_STATE)) return;
    api.loadDraft('local')
      .then((rec) => {
        if (rec && rec.state) setState({ ...DEFAULT_STATE, ...rec.state });
      })
      .catch(() => {
        /* backend недоступен или черновик не сохранён — локальный уже загрузился */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Автосохранение черновика (TZ §10.2): localStorage синхронно,
  // плюс фоновая отправка в backend (TZ §13 POST /api/construct/draft).
  // Чистое состояние не отправляется на сервер: не затираем более свежий
  // серверный черновик, который восстанавливается эффектом выше.
  const draftSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    saveDraft(state);
    if (draftSyncTimer.current) clearTimeout(draftSyncTimer.current);
    const isPristine = JSON.stringify(state) === JSON.stringify(DEFAULT_STATE);
    if (isPristine) return;
    draftSyncTimer.current = setTimeout(() => {
      api.saveDraft(state).catch(() => {
        /* backend недоступен — localStorage уже сохранил черновик */
      });
    }, 500);
    return () => {
      if (draftSyncTimer.current) clearTimeout(draftSyncTimer.current);
    };
  }, [state]);

  const set = useCallback(
    <K extends keyof ConstructorState>(key: K, value: ConstructorState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleFeature = useCallback((id: string) => {
    setState((prev) => {
      const has = prev.featureIds.includes(id);
      return {
        ...prev,
        featureIds: has ? prev.featureIds.filter((x) => x !== id) : [...prev.featureIds, id],
      };
    });
  }, []);

  const toggleIntegration = useCallback((id: string) => {
    setState((prev) => {
      const has = prev.integrationIds.includes(id);
      track(has ? 'integration_removed' : 'integration_added', { integrationId: id });
      return {
        ...prev,
        integrationIds: has
          ? prev.integrationIds.filter((x) => x !== id)
          : [...prev.integrationIds, id],
      };
    });
  }, []);

  const selectProduct = useCallback(
    (id: string, allowed: { features: readonly string[]; integrations: readonly string[] }) => {
      track('product_selected', { productId: id });
      track('step_changed', { to: 'product' });
      setState((prev) => {
        // Prune: удаляем выбранные, которых нет в новом продукте (TZ §10.2).
        const featureIds = prev.featureIds.filter((f) => allowed.features.includes(f));
        const integrationIds = prev.integrationIds.filter((i) =>
          allowed.integrations.includes(i),
        );
        // Публикационный канал по умолчанию берём из доступных.
        return {
          ...prev,
          productId: id,
          featureIds,
          integrationIds,
          publishChannel: allowed.integrations.length
            ? prev.publishChannel && allowed.integrations.includes(prev.publishChannel)
              ? prev.publishChannel
              : allowed.integrations[0]
            : null,
        };
      });
    },
    [],
  );

  const reset = useCallback(() => {
    track('config_reset');
    clearDraft();
    setState(DEFAULT_STATE);
  }, []);

  const isPristine = useMemo(
    () => JSON.stringify(state) === JSON.stringify(DEFAULT_STATE),
    [state],
  );

  return { state, set, toggleFeature, toggleIntegration, selectProduct, reset, isPristine };
}
