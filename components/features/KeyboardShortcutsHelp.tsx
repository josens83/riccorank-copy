'use client';

import { useEffect, useState } from 'react';
import { FiX, FiCommand } from 'react-icons/fi';
import useKeyboardShortcuts, { getShortcutString } from '@/lib/hooks/useKeyboardShortcuts';

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);
    window.addEventListener('show-shortcuts-help', handleShowHelp);
    return () => window.removeEventListener('show-shortcuts-help', handleShowHelp);
  }, []);

  if (!isOpen) return null;

  // Group shortcuts by category
  const navigationShortcuts = shortcuts.filter(s =>
    s.description.includes('이동') || s.description.includes('열기')
  );
  const actionShortcuts = shortcuts.filter(s =>
    !s.description.includes('이동') && !s.description.includes('열기')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <FiCommand className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">키보드 단축키</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            data-modal-close
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Navigation */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">네비게이션</h3>
            <div className="space-y-2">
              {navigationShortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs font-mono bg-gray-800 border border-gray-700 rounded text-gray-300">
                    {getShortcutString(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {actionShortcuts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">액션</h3>
              <div className="space-y-2">
                {actionShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-800 border border-gray-700 rounded text-gray-300">
                      {getShortcutString(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 rounded-b-xl">
          <p className="text-xs text-gray-500 text-center">
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">Shift</kbd>
            {' + '}
            <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-gray-400">?</kbd>
            {' 를 눌러 이 도움말을 다시 열 수 있습니다'}
          </p>
        </div>
      </div>
    </div>
  );
}
