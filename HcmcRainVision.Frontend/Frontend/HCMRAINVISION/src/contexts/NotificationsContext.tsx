/**
 * NotificationsContext – alert subscriptions from API (GET/POST/PUT/DELETE /api/subscriptions)
 * and wards from API for ward dropdown. Notifications list kept as local state (no backend feed).
 */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { NotificationItem, NotificationSettings } from '../types';
import { useAuth } from './AuthContext';
import * as subscriptionApi from '../services/subscriptionApi';
import * as locationApi from '../services/locationApi';
import type { AlertSubscriptionResponseDto } from '../types/api';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  suggestedWards: string[];
  setSuggestedWards: (wards: string[]) => void;
  /** API-driven subscriptions */
  subscriptions: AlertSubscriptionResponseDto[];
  wards: Array<{ WardId: string; WardName: string; DistrictName: string | null }>;
  addSubscription: (wardId: string, thresholdProbability?: number) => Promise<void>;
  removeSubscription: (subscriptionId: string) => Promise<void>;
  updateSubscription: (
    subscriptionId: string,
    data: { ThresholdProbability?: number; IsEnabled?: boolean }
  ) => Promise<void>;
  loadingSubscriptions: boolean;
  refetchSubscriptions: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const DEFAULT_SETTINGS: NotificationSettings = {
  wardIds: [],
  alertOnRain: true,
  alertOnHeavyRain: true,
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettingsState] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [suggestedWards, setSuggestedWards] = useState<string[]>([]);
  const [subscriptions, setSubscriptions] = useState<AlertSubscriptionResponseDto[]>([]);
  const [wards, setWards] = useState<Array<{ WardId: string; WardName: string; DistrictName: string | null }>>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  const refetchSubscriptions = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscriptions([]);
      return;
    }
    setLoadingSubscriptions(true);
    try {
      const [subs, wardsList] = await Promise.all([
        subscriptionApi.getMySubscriptions(),
        locationApi.getWards(),
      ]);
      setSubscriptions(subs);
      setWards(wardsList.map((w) => ({ WardId: w.WardId, WardName: w.WardName, DistrictName: w.DistrictName })));
      setSettingsState((prev) => ({
        ...prev,
        wardIds: subs.map((s) => s.WardId),
        alertOnRain: subs.some((s) => s.IsEnabled) || prev.alertOnRain,
        alertOnHeavyRain: subs.some((s) => s.IsEnabled) || prev.alertOnHeavyRain,
      }));
    } catch {
      setSubscriptions([]);
    } finally {
      setLoadingSubscriptions(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refetchSubscriptions();
  }, [refetchSubscriptions]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateSettings = useCallback((partial: Partial<NotificationSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addSubscription = useCallback(
    async (wardId: string, thresholdProbability = 0.7) => {
      await subscriptionApi.createSubscription({ WardId: wardId, ThresholdProbability: thresholdProbability });
      await refetchSubscriptions();
    },
    [refetchSubscriptions]
  );

  const removeSubscription = useCallback(
    async (subscriptionId: string) => {
      await subscriptionApi.deleteSubscription(subscriptionId);
      await refetchSubscriptions();
    },
    [refetchSubscriptions]
  );

  const updateSubscriptionCb = useCallback(
    async (
      subscriptionId: string,
      data: { ThresholdProbability?: number; IsEnabled?: boolean }
    ) => {
      const sub = subscriptions.find((s) => s.SubscriptionId === subscriptionId);
      if (!sub) return;
      await subscriptionApi.updateSubscription(subscriptionId, {
        ThresholdProbability: data.ThresholdProbability ?? sub.ThresholdProbability,
        IsEnabled: data.IsEnabled ?? sub.IsEnabled,
      });
      await refetchSubscriptions();
    },
    [subscriptions, refetchSubscriptions]
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      settings,
      updateSettings,
      suggestedWards,
      setSuggestedWards,
      subscriptions,
      wards,
      addSubscription,
      removeSubscription,
      updateSubscription: updateSubscriptionCb,
      loadingSubscriptions,
      refetchSubscriptions,
    }),
    [
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      settings,
      updateSettings,
      suggestedWards,
      subscriptions,
      wards,
      addSubscription,
      removeSubscription,
      updateSubscriptionCb,
      loadingSubscriptions,
      refetchSubscriptions,
    ]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return ctx;
}
