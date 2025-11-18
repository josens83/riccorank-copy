'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useThemeStore } from '@/lib/store';
import Link from 'next/link';
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiMessageCircle,
  FiHeart,
  FiAtSign,
  FiAlertCircle,
  FiCreditCard,
  FiInfo,
} from 'react-icons/fi';
import { Notification } from '@/types';

export default function NotificationBell() {
  const { isDarkMode } = useThemeStore();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications(true); // Silent fetch
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        const deletedNotification = notifications.find((n) => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = 'w-4 h-4';
    switch (type) {
      case 'comment':
        return <FiMessageCircle className={iconClass} />;
      case 'like':
        return <FiHeart className={iconClass} />;
      case 'reply':
        return <FiMessageCircle className={iconClass} />;
      case 'mention':
        return <FiAtSign className={iconClass} />;
      case 'system':
        return <FiInfo className={iconClass} />;
      case 'subscription':
        return <FiCreditCard className={iconClass} />;
      case 'report':
        return <FiAlertCircle className={iconClass} />;
      default:
        return <FiBell className={iconClass} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
      case 'reply':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600';
      case 'like':
        return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600';
      case 'mention':
        return isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600';
      case 'system':
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
      case 'subscription':
        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600';
      case 'report':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return new Date(date).toLocaleDateString('ko-KR');
  };

  // Don't show for unauthenticated users
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg interactive border-glow"
        style={{
          background: 'rgba(var(--color-surface), 0.5)',
          color: 'rgb(var(--color-text-primary))'
        }}
        aria-label="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse" style={{ background: 'var(--gradient-primary)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 rounded-2xl glass-strong border z-50"
          style={{
            borderColor: 'rgba(var(--color-border), 0.2)',
            boxShadow: 'var(--shadow-2xl)'
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: 'rgba(var(--color-border), 0.2)' }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: 'rgb(var(--color-text-primary))' }}
            >
              알림{' '}
              {unreadCount > 0 && (
                <span className="text-sm font-normal text-gradient">
                  ({unreadCount}개 안읽음)
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium interactive"
                style={{ color: 'rgb(var(--color-primary))' }}
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div
                className="p-8 text-center text-sm shimmer"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                로딩 중...
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="p-8 text-center text-sm"
                style={{ color: 'rgb(var(--color-text-secondary))' }}
              >
                알림이 없습니다.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group border-b last:border-b-0 card-hover"
                  style={{
                    borderColor: 'rgba(var(--color-border), 0.2)',
                    background: !notification.read ? 'rgba(var(--color-primary), 0.05)' : 'transparent'
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p
                              className="text-sm font-medium"
                              style={{ color: 'rgb(var(--color-text-primary))' }}
                            >
                              {notification.title}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'rgb(var(--color-text-secondary))' }}
                            >
                              {notification.message}
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: 'rgb(var(--color-text-tertiary))' }}
                            >
                              {getTimeAgo(notification.createdAt)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1.5 rounded-lg interactive"
                                style={{ color: 'rgb(var(--color-primary))' }}
                                title="읽음 표시"
                              >
                                <FiCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              className="p-1.5 rounded-lg interactive"
                              style={{ color: 'rgb(220, 38, 38)' }}
                              title="삭제"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Link */}
                        {notification.link && (
                          <Link
                            href={notification.link}
                            onClick={() => {
                              setIsOpen(false);
                              if (!notification.read) {
                                handleMarkAsRead(notification.id);
                              }
                            }}
                            className="text-xs font-medium mt-2 inline-block interactive text-gradient"
                          >
                            자세히 보기 →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="p-3 border-t text-center"
              style={{ borderColor: 'rgba(var(--color-border), 0.2)' }}
            >
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium interactive text-gradient"
              >
                모든 알림 보기
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
