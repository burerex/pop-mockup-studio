import {
  Coupon,
  OrderRecord,
  Product,
  PromoBannerConfig,
  ReferralCode,
  Seller,
  SystemSettings,
  TrackedLink,
} from '../types';

export type CloudStateKey =
  | 'products'
  | 'coupons'
  | 'sellers'
  | 'referrals'
  | 'promo'
  | 'settings';

export interface CloudStoreSnapshot {
  connected: boolean;
  provider?: string;
  state?: {
    products?: Product[];
    coupons?: Coupon[];
    sellers?: Seller[];
    referrals?: ReferralCode[];
    promo?: PromoBannerConfig;
    settings?: SystemSettings;
  };
  orders?: OrderRecord[];
  trackedLinks?: TrackedLink[];
}

export async function fetchCloudStore(): Promise<CloudStoreSnapshot> {
  try {
    const res = await fetch('/api/store', { cache: 'no-store' });
    if (!res.ok) return { connected: false };
    return (await res.json()) as CloudStoreSnapshot;
  } catch {
    return { connected: false };
  }
}

export async function seedCloudStore(payload: {
  seed: Record<CloudStateKey, unknown>;
  seedOrders: OrderRecord[];
  seedLinks: TrackedLink[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/store', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveCloudState(key: CloudStateKey, value: unknown): Promise<void> {
  try {
    await fetch('/api/store', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  } catch {
    // fallback remains persisted in localStorage
  }
}

export async function createCloudOrder(order: OrderRecord): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
  } catch {
    // fallback remains persisted in localStorage
  }
}

export async function syncCloudOrders(orders: OrderRecord[]): Promise<void> {
  try {
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders }),
    });
  } catch {
    // ignore offline errors
  }
}

export async function trackCloudLinkEvent(
  action: 'share' | 'open' | 'convert',
  link: Partial<TrackedLink> & { id: string }
): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, link }),
    });
  } catch {
    // ignore offline errors
  }
}
