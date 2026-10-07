
// API-клиент. TZ §13. В dev — работает поверх mock; в prod — реальный backend.
// Конфигурируется переменной окружения VITE_API_BASE_URL.
import type { ConstructorState } from '@/types';
import type { LeadData } from '@/domain/validation/validate';
import { mockConstructApi } from '@/api/mock/constructApi';

export interface DraftRecord {
  id: string;
  state: ConstructorState;
  savedAt: string;
}

export interface PricingConfigResponse {
  pricing: unknown; // в проде заменяется реальным типом PricingConfig
}

/** Описание API-контракта (TZ §13). */
export interface ConstructApi {
  getProducts(): Promise<unknown[]>;
  getFeatures(): Promise<unknown[]>;
  getIntegrations(): Promise<unknown[]>;
  getPricingConfig(): Promise<PricingConfigResponse>;
  validate(payload: { state: ConstructorState }): Promise<{ ok: boolean; errors: string[] }>;
  submitLead(payload: { data: LeadData; state: ConstructorState }): Promise<{ ok: true; id: string }>;
  saveDraft(state: ConstructorState): Promise<DraftRecord>;
  loadDraft(id: string): Promise<DraftRecord>;
}

const useMock = !import.meta.env.VITE_API_BASE_URL;

export const api: ConstructApi = useMock ? mockConstructApi : realConstructApi();

function realConstructApi(): ConstructApi {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  const headers = { 'Content-Type': 'application/json' };
  const req = <T>(method: string, path: string, body?: unknown): Promise<T> =>
    fetch(`${base}${path}`, {
      method,
      headers: body ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => {
      if (!r.ok) throw new Error(`API ${path}: ${r.status}`);
      return r.json() as Promise<T>;
    });

  return {
    getProducts: () => req('GET', '/api/construct/products') as Promise<unknown[]>,
    getFeatures: () => req('GET', '/api/construct/features') as Promise<unknown[]>,
    getIntegrations: () => req('GET', '/api/construct/integrations') as Promise<unknown[]>,
    getPricingConfig: () => req('GET', '/api/construct/pricing-config') as Promise<PricingConfigResponse>,
    validate: (payload) => req('POST', '/api/construct/validate', payload),
    submitLead: (payload) => req('POST', '/api/construct/leads', payload),
    saveDraft: (state) => req('POST', '/api/construct/draft', { state }),
    loadDraft: (id) => req('GET', `/api/construct/draft/${id}`),
  };
}
