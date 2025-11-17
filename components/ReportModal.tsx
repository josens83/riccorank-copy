'use client';

import { useState } from 'react';
import { useThemeStore } from '@/lib/store';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { useToast } from './Toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'post' | 'comment';
  targetId: string;
  targetTitle?: string;
}

const reportReasons = [
  { value: 'spam', label: '스팸 또는 광고' },
  { value: 'harassment', label: '괴롭힘 또는 혐오 발언' },
  { value: 'inappropriate', label: '부적절한 콘텐츠' },
  { value: 'misinformation', label: '허위 정보' },
  { value: 'other', label: '기타' },
];

export default function ReportModal({ isOpen, onClose, type, targetId, targetTitle }: ReportModalProps) {
  const { isDarkMode } = useThemeStore();
  const { showToast } = useToast();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      showToast('신고 사유를 선택해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId,
          reason: selectedReason,
          description: description || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || '신고가 접수되었습니다.', 'success');
        onClose();
        setSelectedReason('');
        setDescription('');
      } else {
        showToast(data.error || '신고 접수에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
      showToast('신고 접수 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`relative w-full max-w-md rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              신고하기
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {targetTitle && (
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                신고 대상:
              </p>
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {targetTitle.length > 60 ? targetTitle.substring(0, 60) + '...' : targetTitle}
              </p>
            </div>
          )}

          <div>
            <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              신고 사유 <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedReason === reason.value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={`ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {reason.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              상세 설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="신고 사유에 대한 추가 설명을 입력해주세요..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {description.length}/500
            </p>
          </div>

          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              신고해 주셔서 감사합니다. 모든 신고는 검토 후 적절한 조치를 취하겠습니다.
              허위 신고는 제재 대상이 될 수 있습니다.
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedReason}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '신고 중...' : '신고하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
