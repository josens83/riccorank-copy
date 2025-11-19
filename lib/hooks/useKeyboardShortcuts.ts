'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Shortcut key combinations
export interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  global?: boolean; // Works even when input is focused
}

// Default application shortcuts
const useKeyboardShortcuts = (customShortcuts?: Shortcut[]) => {
  const router = useRouter();
  const isInputFocused = useRef(false);

  // Default navigation shortcuts
  const defaultShortcuts: Shortcut[] = [
    {
      key: 'h',
      alt: true,
      description: '홈으로 이동',
      action: () => router.push('/'),
    },
    {
      key: 's',
      alt: true,
      description: '주식 목록으로 이동',
      action: () => router.push('/stocklist'),
    },
    {
      key: 'n',
      alt: true,
      description: '뉴스로 이동',
      action: () => router.push('/news'),
    },
    {
      key: 'c',
      alt: true,
      description: '커뮤니티로 이동',
      action: () => router.push('/stockboard'),
    },
    {
      key: 'm',
      alt: true,
      description: '마이페이지로 이동',
      action: () => router.push('/mypage'),
    },
    {
      key: 'k',
      ctrl: true,
      description: '검색 열기',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
      },
      global: true,
    },
    {
      key: '/',
      description: '검색 열기',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      key: 'Escape',
      description: '모달/검색 닫기',
      action: () => {
        // Close any open modals
        const closeButton = document.querySelector<HTMLButtonElement>('[data-modal-close]');
        if (closeButton) {
          closeButton.click();
        }
        // Blur any focused input
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      },
      global: true,
    },
    {
      key: '?',
      shift: true,
      description: '단축키 도움말',
      action: () => {
        // Dispatch custom event for help modal
        window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
      },
    },
  ];

  // Merge default and custom shortcuts
  const shortcuts = [...defaultShortcuts, ...(customShortcuts || [])];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        // Skip non-global shortcuts when typing
        if (isTyping && !shortcut.global) {
          continue;
        }

        // Check key combination
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const metaMatch = shortcut.meta ? event.metaKey : true;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
};

export default useKeyboardShortcuts;

// Get shortcut display string (e.g., "Ctrl+K")
export function getShortcutString(shortcut: Shortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');

  // Capitalize first letter of key
  const key = shortcut.key.length === 1
    ? shortcut.key.toUpperCase()
    : shortcut.key;
  parts.push(key);

  return parts.join('+');
}
