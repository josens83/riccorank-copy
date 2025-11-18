# 스타일링 가이드

> RANKUP 플랫폼의 일관된 스타일링을 위한 가이드

## 🎨 디자인 시스템

### CSS 변수 기반 테마

`app/globals.css`에 정의된 CSS 변수를 사용하여 다크 모드를 자동으로 지원합니다.

```css
:root {
  --color-bg: 255, 255, 255;
  --color-text-primary: 15, 23, 42;
  /* ... more variables */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: 10, 10, 10;
    --color-text-primary: 248, 250, 252;
  }
}
```

### Tailwind Dark Mode

**권장 방법**: `dark:` 접두사를 사용한 자동 다크 모드

```tsx
// ❌ 기존 방식 (isDarkMode 조건부)
<div className={isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
  Content
</div>

// ✅ 권장 방식 (Tailwind dark: 접두사)
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  Content
</div>
```

## 🔄 마이그레이션 가이드

### 패턴별 변환 예시

#### 1. 배경색 (Background)

```tsx
// Before
className={isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}

// After
className="bg-gray-50 dark:bg-gray-900"
```

#### 2. 텍스트 색상 (Text Color)

```tsx
// Before
className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}

// After
className="text-gray-700 dark:text-gray-300"
```

#### 3. 테두리 (Border)

```tsx
// Before
className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}

// After
className="border-gray-200 dark:border-gray-700"
```

#### 4. 호버 상태 (Hover)

```tsx
// Before
className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}

// After
className="hover:bg-gray-100 dark:hover:bg-gray-800"
```

#### 5. 복합 조건

```tsx
// Before
<div className={`card ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

// After
<div className="card bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
```

## 🧩 UI 컴포넌트 사용

새로 생성된 UI 컴포넌트는 이미 다크 모드를 지원합니다.

```tsx
import { Button, Card, Badge, Input } from '@/components/ui';

// 자동으로 다크 모드 지원
<Button variant="primary">Click me</Button>
<Card variant="glass">Content</Card>
<Badge variant="success">Active</Badge>
<Input label="Email" placeholder="Enter email" />
```

## 📋 변환 체크리스트

### 우선순위 파일

다음 파일들에서 `isDarkMode` 사용이 많으므로 우선 변환 권장:

1. `app/login/page.tsx`
2. `app/signup/page.tsx`
3. `app/admin/page.tsx`
4. `app/mypage/page.tsx`
5. `app/verify-email/page.tsx`
6. `components/Header.tsx`
7. `components/GlobalSearch.tsx`

### 변환 단계

1. **파일 열기**: 변환할 파일 선택
2. **useThemeStore 제거**: `const { isDarkMode } = useThemeStore();` 삭제
3. **조건부 클래스 변환**: 위의 패턴을 참고하여 변환
4. **테스트**: 라이트/다크 모드에서 정상 작동 확인

### 자동 변환 스크립트 (참고용)

간단한 패턴은 sed로 자동 변환 가능:

```bash
# 배경색 패턴
sed -i "s|isDarkMode ? 'bg-gray-900' : 'bg-gray-50'|bg-gray-50 dark:bg-gray-900|g" file.tsx

# 텍스트 색상 패턴
sed -i "s|isDarkMode ? 'text-white' : 'text-gray-900'|text-gray-900 dark:text-white|g" file.tsx
```

## 🎯 베스트 프랙티스

### 1. 의미론적 색상 사용

```tsx
// ❌ 하드코딩된 색상
<div className="bg-gray-800">

// ✅ 의미론적 클래스
<div className="bg-background-primary">
```

### 2. 유틸리티 클래스 활용

`app/globals.css`에 정의된 유틸리티 클래스 사용:

```tsx
<div className="glass">Glass morphism effect</div>
<div className="glass-strong">Stronger glass effect</div>
<div className="border-glow">Animated border</div>
<div className="card-hover">Hover animation</div>
```

### 3. 컴포넌트 기반 접근

반복되는 패턴은 컴포넌트로 추출:

```tsx
// ❌ 매번 스타일 반복
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">

// ✅ Card 컴포넌트 사용
<Card variant="default" padding="lg">
  Content
</Card>
```

## 📊 현재 상태

- **총 isDarkMode 사용**: 617개
- **변환 완료**: 0개
- **목표**: 점진적 마이그레이션

## 🔗 관련 문서

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [UI 컴포넌트 라이브러리](/components/ui/index.ts)
- [CSS 변수](/app/globals.css)
