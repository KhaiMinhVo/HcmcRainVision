/**
 * NotificationDropdown – bell icon, unread count, list + "Đăng ký nhận thông báo"
 */

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationsContext';
import NotificationSettingsModal from './NotificationSettingsModal';

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return 'Vừa xong';
  if (diffM < 60) return `${diffM} phút trước`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  return d.toLocaleDateString('vi-VN');
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95"
        aria-label="Thông báo"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[1000] mt-2 flex max-h-[80vh] w-96 animate-slide-up flex-col rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(true);
              setOpen(false);
            }}
            className="mx-3 mt-2 py-2 px-3 text-left text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            Đăng ký nhận thông báo, cảnh báo mưa theo khu vực
          </button>
          <div className="overflow-y-auto flex-1 min-h-0">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Chưa có thông báo
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 20).map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className={`w-full p-3 text-left transition-colors duration-150 hover:bg-gray-50 ${!n.read ? 'border-l-2 border-sky-500 bg-sky-50/50' : ''}`}
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {n.title}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <NotificationSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
