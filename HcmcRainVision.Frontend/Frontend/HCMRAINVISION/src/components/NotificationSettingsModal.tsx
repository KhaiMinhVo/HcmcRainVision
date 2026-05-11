/**
 * NotificationSettingsModal – đăng ký nhận thông báo theo phường (API: /api/subscriptions, /api/location/wards)
 */
import { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import { useFavorites } from '../contexts/FavoritesContext';
import * as locationApi from '../services/locationApi';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  const {
    subscriptions,
    wards,
    addSubscription,
    removeSubscription,
    updateSubscription,
    refetchSubscriptions,
    suggestedWards,
    setSuggestedWards,
    loadingSubscriptions,
  } = useNotifications();
  const { favoriteCameras } = useFavorites();

  const subscribedWardIds = subscriptions.map((s) => s.WardId);
  const [selectedWardIds, setSelectedWardIds] = useState<string[]>(subscribedWardIds);
  const [alertOnRain, setAlertOnRain] = useState(true);
  const [alertOnHeavyRain, setAlertOnHeavyRain] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [districtsList, setDistrictsList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [filteredWards, setFilteredWards] = useState<Array<{ WardId: string; WardName: string; DistrictName: string | null }> | null>(null);

  useEffect(() => {
    if (isOpen) {
      locationApi.getDistricts().then(setDistrictsList).catch(() => setDistrictsList([]));
      setSelectedDistrict('');
      setFilteredWards(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDistrict) {
      setFilteredWards(null);
      return;
    }
    locationApi.getWardsByDistrict(selectedDistrict).then((w) =>
      setFilteredWards(w.map((x) => ({ WardId: x.WardId, WardName: x.WardName, DistrictName: x.DistrictName })))
    ).catch(() => setFilteredWards([]));
  }, [selectedDistrict]);

  const displayWards = filteredWards !== null ? filteredWards : wards;

  useEffect(() => {
    const wardNames = new Set<string>();
    favoriteCameras.forEach((c) => {
      if (c.ward) wardNames.add(c.ward);
    });
    setSuggestedWards([...wardNames].sort());
  }, [favoriteCameras, setSuggestedWards]);

  useEffect(() => {
    if (isOpen) {
      setSelectedWardIds(subscribedWardIds);
      setAlertOnRain(subscriptions.some((s) => s.IsEnabled) ?? true);
      setAlertOnHeavyRain(subscriptions.some((s) => s.IsEnabled) ?? true);
      setError(null);
    }
  }, [isOpen, subscribedWardIds, subscriptions]);

  const toggleWard = (wardId: string) => {
    setSelectedWardIds((prev) =>
      prev.includes(wardId) ? prev.filter((id) => id !== wardId) : [...prev, wardId]
    );
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const toAdd = selectedWardIds.filter((id) => !subscribedWardIds.includes(id));
      const toRemove = subscriptions.filter((s) => !selectedWardIds.includes(s.WardId));
      for (const sub of toRemove) {
        await removeSubscription(sub.SubscriptionId);
      }
      for (const wardId of toAdd) {
        await addSubscription(wardId, 0.7);
      }
      const isEnabled = alertOnRain || alertOnHeavyRain;
      const toUpdate = subscriptions.filter(
        (s) => selectedWardIds.includes(s.WardId) && s.IsEnabled !== isEnabled
      );
      for (const sub of toUpdate) {
        await updateSubscription(sub.SubscriptionId, {
          IsEnabled: isEnabled,
          ThresholdProbability: sub.ThresholdProbability,
        });
      }
      await refetchSubscriptions();
      onClose();
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Lưu thất bại.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[1100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Đăng ký nhận thông báo mưa
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
            )}
            {loadingSubscriptions ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Qu?n</p>
                  <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm">
                    <option value="">T?t c? qu?n</option>
                    {districtsList.map((d) => (<option key={d} value={d}>{d}</option>))}
                  </select>
                  
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Chọn khu vực (phường) muốn nhận cảnh báo
                  </p>
                  {suggestedWards.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">Gợi ý từ khu vực yêu thích:</p>
                  )}
                  {suggestedWards.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {displayWards.filter((w) => suggestedWards.includes(w.WardName)).map((w) => (
                          <button
                            key={w.WardId}
                            type="button"
                            onClick={() => toggleWard(w.WardId)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              selectedWardIds.includes(w.WardId)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {w.WardName}
                          </button>
                        ))}
                    </div>
                  )}
                  <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {displayWards.map((w) => (
                        <label
                          key={w.WardId}
                          className="inline-flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedWardIds.includes(w.WardId)}
                            onChange={() => toggleWard(w.WardId)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {w.WardName}
                            {w.DistrictName ? ` (${w.DistrictName})` : ''}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Loại cảnh báo</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertOnRain}
                      onChange={(e) => setAlertOnRain(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Cảnh báo khi có mưa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertOnHeavyRain}
                      onChange={(e) => setAlertOnHeavyRain(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Cảnh báo khi mưa nặng</span>
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadingSubscriptions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
