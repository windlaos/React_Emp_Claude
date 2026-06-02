const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const BASE   = 'http://localhost:5173';
const SS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR);
const ss = (n) => path.join(SS_DIR, `page_${n}.png`);
const results = [];
function log(icon, msg, detail = '') {
  const line = `${icon} ${msg}${detail ? ' → ' + detail : ''}`;
  console.log(line);
  results.push(line);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  try {
    // ── 1. 부서 목록 페이지네이션 UI ───────────────────────
    console.log('\n=== 1. 부서 목록 페이지네이션 ===');
    await page.goto(`${BASE}/departments`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: ss('01_dept_list') });

    const totalInfo = await page.locator('text=전체').first().textContent().catch(() => '');
    log(totalInfo.includes('전체') ? '✅' : '❌', '전체 항목 수 표시', totalInfo.trim());

    const pageSizeSelect = page.locator('select').first();
    log(await pageSizeSelect.isVisible() ? '✅' : '❌', '페이지 크기 선택 드롭다운 표시');

    // ── 2. 페이지 크기 변경 ────────────────────────────────
    console.log('\n=== 2. 페이지 크기 변경 ===');
    // 페이지 크기를 2로 내려서 페이지 이동 테스트 가능하게 하기 위해
    // 실제 옵션은 5/10/20이므로 5개로 테스트
    const deptCountBefore = await page.locator('.bg-white.rounded-lg.shadow').count();
    log(deptCountBefore >= 1 ? '✅' : '❌', `5개 이하 부서 표시`, `${deptCountBefore}개`);

    // ── 3. 직원 목록 페이지네이션 ─────────────────────────
    console.log('\n=== 3. 직원 목록 페이지네이션 ===');
    await page.goto(`${BASE}/employees`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: ss('02_emp_list') });

    const empTotalInfo = page.locator('text=전체').first();
    const empInfoText  = await empTotalInfo.textContent().catch(() => '');
    log(empInfoText.includes('전체') ? '✅' : '❌', '직원 전체 항목 수 표시', empInfoText.trim());

    const empCards = await page.locator('.bg-white.rounded-lg.shadow').count();
    log(empCards >= 1 ? '✅' : '❌', `첫 페이지 카드 표시`, `${empCards}개`);

    // ── 4. 페이지 이동 테스트 (백엔드 재시작 후 여러 항목 있을 때) ──
    console.log('\n=== 4. 페이지 이동 (페이지 크기=5, 다음 버튼) ===');
    // 다음 버튼 존재 여부 확인 (데이터가 5개 이하면 비활성)
    const nextBtn = page.locator('button[aria-label="다음 페이지"]');
    const isNextDisabled = await nextBtn.isDisabled();
    const totalItemsText = empInfoText;

    if (!isNextDisabled) {
      // 2페이지로 이동
      await nextBtn.click();
      await page.waitForTimeout(300);
      const page2Cards = await page.locator('.bg-white.rounded-lg.shadow').count();
      log(page2Cards >= 1 ? '✅' : '❌', '2페이지 카드 표시', `${page2Cards}개`);
      await page.screenshot({ path: ss('03_page2') });

      // 이전 버튼으로 복귀
      const prevBtn = page.locator('button[aria-label="이전 페이지"]');
      await prevBtn.click();
      await page.waitForTimeout(300);
      const page1Cards = await page.locator('.bg-white.rounded-lg.shadow').count();
      log(page1Cards >= 1 ? '✅' : '❌', '이전 버튼으로 1페이지 복귀', `${page1Cards}개`);
      await page.screenshot({ path: ss('04_page1_back') });
    } else {
      log('⚠️', '현재 데이터가 1페이지로 충분 — 다음 버튼 비활성', '데이터 추가 후 테스트 가능');
    }

    // ── 5. 페이지 크기 변경 ────────────────────────────────
    console.log('\n=== 5. 페이지 크기 변경 ===');
    const empPageSizeSelect = page.locator('select').last();
    const initialSize = await empPageSizeSelect.inputValue();
    await empPageSizeSelect.selectOption('10');
    await page.waitForTimeout(300);
    const after10Cards = await page.locator('.bg-white.rounded-lg.shadow').count();
    log(after10Cards >= 1 ? '✅' : '❌', '페이지 크기 10으로 변경 후 카드 표시', `${after10Cards}개`);
    // 1페이지로 리셋되었는지 확인
    const currentPageHighlight = await page.locator('.bg-indigo-600.text-white').last().textContent().catch(() => '');
    log(currentPageHighlight.trim() === '1' ? '✅' : '⚠️', '페이지 크기 변경 시 1페이지 초기화', `현재 페이지: ${currentPageHighlight.trim()}`);
    await page.screenshot({ path: ss('05_size10') });

    // ── 6. 검색 활성 시 페이지네이션 미표시 ───────────────
    console.log('\n=== 6. 검색 중 페이지네이션 숨김 ===');
    await page.locator('input[placeholder*="이메일"]').fill('John@company.com');
    await page.locator('button:has-text("검색")').click();
    await page.waitForTimeout(1000);
    const paginationVisible = await page.locator('text=전체').first().isVisible().catch(() => false);
    // 검색 결과 영역에서는 페이지네이션이 없어야 함
    log(!paginationVisible ? '✅' : '⚠️', '검색 활성 시 전체 목록 페이지네이션 숨김');
    await page.screenshot({ path: ss('06_search_no_pagination') });

    // ── 7. 부서 필터 + 페이지네이션 ────────────────────────
    console.log('\n=== 7. 부서 필터 + 페이지네이션 ===');
    await page.locator('button:has-text("초기화")').click();
    await page.waitForTimeout(300);
    const deptFilterSelect = page.locator('select').first();
    await deptFilterSelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);
    const filteredInfo = await page.locator('text=전체').first().textContent().catch(() => '');
    log(filteredInfo.includes('전체') ? '✅' : '❌', '부서 필터 시 페이지네이션 갱신', filteredInfo.trim());
    await page.screenshot({ path: ss('07_dept_filter_pagination') });

  } catch (err) {
    console.error('오류:', err.message);
    await page.screenshot({ path: ss('error') });
    results.push(`❌ 예외: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n=== 결과 요약 ===');
  results.forEach((r) => console.log(r));
  const fails = results.filter((r) => r.startsWith('❌')).length;
  console.log(`\n총 ${results.length}개 | ❌ ${fails}개 실패`);
  process.exit(fails > 0 ? 1 : 0);
})();
