
// Загрузка каталога (продукты/функции/интеграции/тарифы) через API-клиент.
// В dev работает поверх mock (TZ §16), в prod — реальный backend.
// Конфиг выступает синхронным fallback, чтобы страница не пустела.
import { useEffect, useState } from 'react';
import { PRODUCTS } from '@/config/products';
import { FEATURES } from '@/config/features';
import { INTEGRATIONS } from '@/config/integrations';
import { PRICING_CONFIG, type PricingConfig } from '@/config/pricing-config';
import { api } from '@/api/client';
import type { Feature, Integration, Product } from '@/types';

export interface ConstructData {
  products: Product[];
  features: Feature[];
  integrations: Integration[];
  pricing: PricingConfig;
  loading: boolean;
}

export function useConstructData(): ConstructData {
  const [data, setData] = useState<ConstructData>(() => ({
    products: [...PRODUCTS],
    features: [...FEATURES],
    integrations: [...INTEGRATIONS],
    pricing: PRICING_CONFIG,
    loading: true,
  }));

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [products, features, integrations, pricingResp] = await Promise.all([
          api.getProducts(),
          api.getFeatures(),
          api.getIntegrations(),
          api.getPricingConfig(),
        ]);
        if (!alive) return;
        setData({
          products: (products as Product[])?.length ? (products as Product[]) : [...PRODUCTS],
          features: (features as Feature[])?.length ? (features as Feature[]) : [...FEATURES],
          integrations: (integrations as Integration[])?.length
            ? (integrations as Integration[])
            : [...INTEGRATIONS],
          pricing:
            (pricingResp.pricing as PricingConfig) ?? PRICING_CONFIG,
          loading: false,
        });
      } catch {
        // API недоступен — остаёмся на конфигурационном fallback.
        if (alive) setData((d) => ({ ...d, loading: false }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
