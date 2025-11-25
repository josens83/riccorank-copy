import { test, expect } from '@playwright/test';

/**
 * E2E Test: 사용자 여정 테스트
 * 주요 사용자 시나리오를 종단간 테스트
 */

test.describe('사용자 여정 - 비회원', () => {
  test('홈페이지 방문 및 주요 섹션 탐색', async ({ page }) => {
    // 홈페이지 접속
    await page.goto('/');
    await expect(page).toHaveTitle(/RANKUP/i);

    // 헤더 확인
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByRole('link', { name: /주식랭킹/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /뉴스/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /커뮤니티/i })).toBeVisible();

    // 주식 랭킹 클릭
    await page.getByRole('link', { name: /주식랭킹/i }).click();
    await expect(page).toHaveURL(/\/stocklist/);

    // 주식 리스트 확인
    await expect(page.locator('table')).toBeVisible();

    // 검색 기능
    await page.getByPlaceholder(/종목명 검색/i).fill('삼성전자');
    await page.getByPlaceholder(/종목명 검색/i).press('Enter');
  });

  test('뉴스 피드 탐색', async ({ page }) => {
    await page.goto('/news');

    // 뉴스 카드 확인
    const newsCards = page.locator('[data-testid="news-card"]');
    await expect(newsCards.first()).toBeVisible();

    // 뉴스 상세 페이지 이동
    await newsCards.first().click();
    await expect(page).toHaveURL(/\/news\/.+/);
  });

  test('커뮤니티 게시글 탐색', async ({ page }) => {
    await page.goto('/stockboard');

    // 게시글 리스트 확인
    const posts = page.locator('[data-testid="post-card"]');
    await expect(posts.first()).toBeVisible();

    // 게시글 상세 이동
    await posts.first().click();
    await expect(page).toHaveURL(/\/stockboard\/.+/);

    // 댓글 섹션 확인
    await expect(page.getByText(/댓글/i)).toBeVisible();
  });

  test('통합 검색 사용', async ({ page }) => {
    await page.goto('/');

    // 검색 열기
    await page.keyboard.press('Control+K');

    // 검색 모달 확인
    const searchModal = page.locator('[role="dialog"]');
    await expect(searchModal).toBeVisible();

    // 검색어 입력
    await page.getByPlaceholder(/검색/i).fill('주식');

    // 검색 결과 확인
    await expect(page.locator('[data-testid="search-result"]')).toBeVisible();
  });
});

test.describe('사용자 여정 - 회원', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 (실제 테스트에서는 테스트 계정 사용)
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill('test@example.com');
    await page.getByLabel(/비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /로그인/i }).click();

    // 로그인 완료 대기
    await page.waitForURL('/');
  });

  test('게시글 작성 및 수정', async ({ page }) => {
    // 게시글 작성 페이지 이동
    await page.goto('/stockboard/write');

    // 제목 입력
    await page.getByLabel(/제목/i).fill('E2E 테스트 게시글');

    // 카테고리 선택
    await page.getByLabel(/카테고리/i).selectOption('free');

    // 내용 입력 (Rich Editor)
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('이것은 E2E 테스트를 위한 게시글입니다.');

    // 등록 버튼 클릭
    await page.getByRole('button', { name: /등록/i }).click();

    // 게시글 상세 페이지로 이동 확인
    await page.waitForURL(/\/stockboard\/.+/);
    await expect(page.getByText('E2E 테스트 게시글')).toBeVisible();

    // 수정 버튼 클릭
    await page.getByRole('button', { name: /수정/i }).click();

    // 제목 수정
    await page.getByLabel(/제목/i).fill('E2E 테스트 게시글 (수정됨)');
    await page.getByRole('button', { name: /수정완료/i }).click();

    // 수정된 내용 확인
    await expect(page.getByText('E2E 테스트 게시글 (수정됨)')).toBeVisible();
  });

  test('댓글 작성 및 삭제', async ({ page }) => {
    // 게시글 상세 페이지 이동
    await page.goto('/stockboard/1'); // 테스트 게시글 ID

    // 댓글 입력
    const commentInput = page.getByPlaceholder(/댓글을 입력하세요/i);
    await commentInput.fill('E2E 테스트 댓글입니다.');
    await page.getByRole('button', { name: /댓글 작성/i }).click();

    // 댓글 확인
    await expect(page.getByText('E2E 테스트 댓글입니다.')).toBeVisible();

    // 댓글 삭제
    await page.locator('[data-testid="delete-comment"]').first().click();

    // 확인 다이얼로그
    await page.getByRole('button', { name: /삭제/i }).click();

    // 댓글 삭제 확인
    await expect(page.getByText('E2E 테스트 댓글입니다.')).not.toBeVisible();
  });

  test('게시글 좋아요 및 북마크', async ({ page }) => {
    await page.goto('/stockboard/1');

    // 좋아요 버튼 클릭
    const likeButton = page.getByRole('button', { name: /좋아요/i });
    await likeButton.click();

    // 좋아요 활성화 확인
    await expect(likeButton).toHaveClass(/active/);

    // 북마크 버튼 클릭
    const bookmarkButton = page.getByRole('button', { name: /북마크/i });
    await bookmarkButton.click();

    // 북마크 활성화 확인
    await expect(bookmarkButton).toHaveClass(/active/);

    // 마이페이지에서 북마크 확인
    await page.goto('/mypage');
    await page.getByRole('tab', { name: /북마크/i }).click();
    await expect(page.locator('[data-testid="post-card"]').first()).toBeVisible();
  });

  test('프로필 수정', async ({ page }) => {
    await page.goto('/mypage/edit');

    // 닉네임 수정
    const nameInput = page.getByLabel(/닉네임/i);
    await nameInput.clear();
    await nameInput.fill('E2E 테스트 사용자');

    // 저장 버튼 클릭
    await page.getByRole('button', { name: /저장/i }).click();

    // 성공 메시지 확인
    await expect(page.getByText(/수정되었습니다/i)).toBeVisible();

    // 마이페이지에서 변경 확인
    await page.goto('/mypage');
    await expect(page.getByText('E2E 테스트 사용자')).toBeVisible();
  });
});

test.describe('사용자 여정 - 구독 및 결제', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill('test@example.com');
    await page.getByLabel(/비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /로그인/i }).click();
    await page.waitForURL('/');
  });

  test('구독 플랜 선택 및 결제 프로세스', async ({ page }) => {
    await page.goto('/subscribe');

    // Premium 플랜 선택
    await page
      .locator('[data-testid="plan-premium"]')
      .getByRole('button', { name: /시작하기/i })
      .click();

    // 결제 페이지로 이동 확인
    await expect(page).toHaveURL(/\/subscribe\/checkout/);

    // 결제 정보 입력 (테스트 모드)
    await page.getByLabel(/결제 방법/i).selectOption('card');

    // 결제 버튼 클릭 (실제 결제는 테스트 환경에서만)
    await page.getByRole('button', { name: /결제하기/i }).click();

    // 결제 완료 확인
    await page.waitForURL('/subscribe/success');
    await expect(page.getByText(/결제가 완료/i)).toBeVisible();
  });
});

test.describe('접근성 테스트', () => {
  test('키보드 네비게이션', async ({ page }) => {
    await page.goto('/');

    // Tab 키로 네비게이션
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Enter 키로 링크 클릭
    await page.keyboard.press('Enter');

    // 페이지 이동 확인
    await page.waitForURL(/(?!\/)/);
  });

  test('스크린 리더 레이블', async ({ page }) => {
    await page.goto('/');

    // ARIA 레이블 확인
    const nav = page.locator('nav');
    await expect(nav).toHaveAttribute('aria-label');

    // alt 텍스트 확인
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
  });
});

test.describe('모바일 반응형 테스트', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE 크기
  });

  test('모바일 네비게이션', async ({ page }) => {
    await page.goto('/');

    // 햄버거 메뉴 확인
    const menuButton = page.getByRole('button', { name: /메뉴/i });
    await expect(menuButton).toBeVisible();

    // 메뉴 열기
    await menuButton.click();

    // 네비게이션 메뉴 확인
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('모바일 게시글 작성', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill('test@example.com');
    await page.getByLabel(/비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /로그인/i }).click();

    // 게시글 작성
    await page.goto('/stockboard/write');
    await page.getByLabel(/제목/i).fill('모바일 테스트');

    // 모바일 에디터 확인
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
    await editor.fill('모바일에서 작성한 게시글');

    await page.getByRole('button', { name: /등록/i }).click();

    // 성공 확인
    await page.waitForURL(/\/stockboard\/.+/);
    await expect(page.getByText('모바일 테스트')).toBeVisible();
  });
});

test.describe('성능 테스트', () => {
  test('페이지 로드 시간', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // 3초 이내 로드 확인
    expect(loadTime).toBeLessThan(3000);

    console.log(`페이지 로드 시간: ${loadTime}ms`);
  });

  test('이미지 최적화 확인', async ({ page }) => {
    await page.goto('/');

    // 이미지 로드 확인
    const images = page.locator('img[loading="lazy"]');
    const count = await images.count();

    // Lazy loading 적용 확인
    expect(count).toBeGreaterThan(0);

    console.log(`Lazy loading 이미지 수: ${count}`);
  });
});

test.describe('에러 처리 테스트', () => {
  test('404 페이지', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // 404 페이지 확인
    await expect(page.getByText(/404|페이지를 찾을 수 없습니다/i)).toBeVisible();

    // 홈으로 돌아가기 링크
    await page.getByRole('link', { name: /홈으로/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('네트워크 오류 처리', async ({ page, context }) => {
    // 네트워크 오프라인 시뮬레이션
    await context.setOffline(true);

    await page.goto('/');

    // 오프라인 메시지 확인
    await expect(
      page.getByText(/네트워크 연결을 확인해주세요|오프라인/i)
    ).toBeVisible();

    // 네트워크 복구
    await context.setOffline(false);
    await page.reload();

    // 정상 로드 확인
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('보안 테스트', () => {
  test('CSRF 토큰 확인', async ({ page }) => {
    await page.goto('/login');

    // 폼 제출 시 CSRF 토큰 포함 확인
    const form = page.locator('form');
    const csrfToken = await form.locator('input[name="csrfToken"]').count();

    expect(csrfToken).toBeGreaterThan(0);
  });

  test('XSS 방어', async ({ page }) => {
    // 로그인
    await page.goto('/login');
    await page.getByLabel(/이메일/i).fill('test@example.com');
    await page.getByLabel(/비밀번호/i).fill('testpassword123');
    await page.getByRole('button', { name: /로그인/i }).click();

    // 게시글 작성
    await page.goto('/stockboard/write');

    // XSS 시도
    const xssPayload = '<script>alert("XSS")</script>';
    await page.getByLabel(/제목/i).fill(xssPayload);

    const editor = page.locator('.ProseMirror');
    await editor.fill(xssPayload);

    await page.getByRole('button', { name: /등록/i }).click();

    // 페이지 이동 대기
    await page.waitForURL(/\/stockboard\/.+/);

    // 스크립트가 실행되지 않고 텍스트로 표시되는지 확인
    const content = await page.textContent('body');
    expect(content).toContain('<script>');
    expect(content).not.toContain('alert("XSS")');
  });
});
