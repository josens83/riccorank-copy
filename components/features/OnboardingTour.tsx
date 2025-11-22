'use client';

import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';

export interface OnboardingStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
}

interface OnboardingTourProps {
  steps: OnboardingStep[];
  tourKey: string; // Unique key for localStorage
  onComplete?: () => void;
}

export default function OnboardingTour({ steps, tourKey, onComplete }: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Check if tour was already completed
    const completed = localStorage.getItem(`onboarding_${tourKey}`);
    if (!completed) {
      // Wait for page to load
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [tourKey]);

  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (!step) return;

    // Find target element
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isActive, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`onboarding_${tourKey}`, 'true');
    setIsActive(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding_${tourKey}`, 'true');
    setIsActive(false);
  };

  if (!isActive || !steps[currentStep]) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Dark backdrop */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Highlight cutout */}
        {highlightRect && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-2xl animate-pulse pointer-events-auto"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            }}
          />
        )}

        {/* Tooltip */}
        {highlightRect && (
          <div
            className="absolute pointer-events-auto"
            style={{
              top: highlightRect.bottom + 16,
              left: highlightRect.left,
              maxWidth: '400px',
            }}
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentStep + 1} / {steps.length}
                  </p>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6">{step.content}</p>

              {/* Progress bar */}
              <div className="h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  건너뛰기
                </button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      이전
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center gap-1"
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        완료
                        <FiCheck className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        다음
                        <FiChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Pre-defined onboarding tours
export const ONBOARDING_TOURS = {
  homepage: [
    {
      target: '[data-tour="search"]',
      title: '통합 검색',
      content: '주식, 뉴스, 게시글을 한 번에 검색할 수 있습니다.',
    },
    {
      target: '[data-tour="stocks"]',
      title: '실시간 주식 정보',
      content: 'KOSPI, KOSDAQ 종목의 실시간 시세와 랭킹을 확인하세요.',
    },
    {
      target: '[data-tour="news"]',
      title: '최신 금융 뉴스',
      content: '실시간으로 업데이트되는 금융 뉴스를 확인하세요.',
    },
    {
      target: '[data-tour="community"]',
      title: '커뮤니티',
      content: '다른 투자자들과 의견을 나누고 정보를 공유하세요.',
    },
  ],
  stocklist: [
    {
      target: '[data-tour="market-filter"]',
      title: '시장 필터',
      content: 'KOSPI, KOSDAQ을 선택하여 종목을 필터링할 수 있습니다.',
    },
    {
      target: '[data-tour="sort"]',
      title: '정렬',
      content: '가격, 변동률, 거래량 등으로 정렬할 수 있습니다.',
    },
    {
      target: '[data-tour="bookmark"]',
      title: '북마크',
      content: '관심 종목을 북마크하여 빠르게 접근하세요.',
    },
  ],
  mypage: [
    {
      target: '[data-tour="profile"]',
      title: '프로필 수정',
      content: '이름, 이메일, 프로필 이미지를 변경할 수 있습니다.',
    },
    {
      target: '[data-tour="security"]',
      title: '보안 설정',
      content: '2단계 인증을 활성화하여 계정을 보호하세요.',
    },
    {
      target: '[data-tour="subscription"]',
      title: '구독 관리',
      content: '프리미엄 기능을 사용하려면 구독을 시작하세요.',
    },
  ],
} as const;
