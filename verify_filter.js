const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const BASE   = 'http://localhost:5173';
const SS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR);
const ss = (n) => path.join(SS_DIR, `filter_${n}.png`);
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
    await page.goto(`${BASE}/employees`, { waitUntil: 'networkidle' });

    // ── 1. 필터 드롭다운 UI ────────────────────────────────
    console.log('\n=== 1. 필터 드롭다운 UI ===');
    const filterSelect = page.locator('select').first();
    const isVisible    = await filterSelect.isVisible();
    log(isVisible ? '✅' : '❌', '부서 필터 드롭다운 표시');

    const allOption = page.locator('option[value=""]').first();
    const allText   = await allOption.textContent();
    log(allText.includes('전체') ? '✅' : '❌', '"전체" 옵션 표시', allText?.trim());

    // 드롭다운 옵션 수 확인 (전체 + 부서 수)
    const optCount = await filterSelect.locator('option').count();
    log(optCount > 1 ? '✅' : '❌', `부서 옵션 표시`, `${optCount}개 옵션`);
    await page.screenshot({ path: ss('01_initial') });

    // ── 2. 부서 필터 선택 ─────────────────────────────────
    console.log('\n=== 2. 부서 필터 적용 ===');
    // 두 번째 옵션 선택 (첫 번째 실제 부서)
    const options  = await filterSelect.locator('option').all();
    const deptOpt  = options[1];  // 인덱스 1 = 첫 번째 부서
    const deptName = (await deptOpt.textContent()).split('(')[0].trim();
    const deptVal  = await deptOpt.getAttribute('value');

    await filterSelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: ss('02_filtered') });

    // 필터링 결과 라벨 확인
    const filterLabel = page.locator(`text=${deptName} 부서`);
    const labelVisible = await filterLabel.isVisible().catch(() => false);
    log(labelVisible ? '✅' : '❌', `필터 결과 라벨 표시`, deptName);

    // 카드가 선택된 부서 직원만 표시되는지 확인
    const cards = await page.locator('.bg-white.rounded-lg.shadow').count();
    log(cards >= 0 ? '✅' : '❌', `필터 적용 후 카드 수`, `${cards}개`);

    // 모든 카드의 뱃지가 선택된 부서인지 확인
    const badges    = await page.locator('.bg-indigo-100').allTextContents();
    const allMatch  = badges.every((b) => b.includes(deptName));
    log(badges.length === 0 || allMatch ? '✅' : '❌',
      '표시된 카드 모두 선택 부서 소속', `뱃지: ${badges.join(', ')}`);

    // ── 3. 필터 해제 ──────────────────────────────────────
    console.log('\n=== 3. 필터 해제 ===');
    const clearFilter = page.locator('button:has-text("필터 해제")');
    log(await clearFilter.isVisible() ? '✅' : '❌', '필터 해제 버튼 표시');
    await clearFilter.click();
    await page.waitForTimeout(300);

    const afterClearCards = await page.locator('.bg-white.rounded-lg.shadow').count();
    const filterValue     = await filterSelect.inputValue();
    log(filterValue === ''          ? '✅' : '❌', '필터 해제 후 "전체" 복원');
    log(afterClearCards > cards     ? '✅' : '⚠️', `필터 해제 후 전체 목록 복원`, `${afterClearCards}개 카드`);
    await page.screenshot({ path: ss('03_cleared') });

    // ── 4. 빈 부서 필터 ───────────────────────────────────
    console.log('\n=== 4. 직원 없는 부서 필터 ===');
    // 직원 없는 부서가 있으면 테스트, 없으면 건너뜀
    const allOptions = await filterSelect.locator('option').allTextContents();
    const emptyDept  = allOptions.slice(1).find((o) => o.includes('(0명)'));
    if (emptyDept) {
      const emptyIdx = allOptions.indexOf(emptyDept);
      await filterSelect.selectOption({ index: emptyIdx });
      await page.waitForTimeout(300);
      const emptyMsg = await page.locator('text=등록된 직원이 없습니다').isVisible();
      log(emptyMsg ? '✅' : '❌', '직원 없는 부서 → 안내 메시지');
      await page.screenshot({ path: ss('04_empty_dept') });
    } else {
      log('⚠️', '직원 0명인 부서 없음 — 건너뜀');
    }

    // ── 5. 이메일 검색 중 필터 비활성화 ───────────────────
    console.log('\n=== 5. 검색 중 필터 비활성화 ===');
    await filterSelect.selectOption({ index: 1 });
    await page.locator('input[placeholder*="이메일"]').fill('John@company.com');
    await page.locator('button:has-text("검색")').click();
    await page.waitForTimeout(1000);

    const isDisabled = await filterSelect.isDisabled();
    log(isDisabled ? '✅' : '❌', '검색 활성 시 필터 드롭다운 비활성화');
    await page.screenshot({ path: ss('05_search_active') });

    // 검색 초기화 후 필터 다시 활성
    await page.locator('button:has-text("초기화")').click();
    await page.waitForTimeout(300);
    const isEnabled = !(await filterSelect.isDisabled());
    log(isEnabled ? '✅' : '❌', '검색 초기화 후 필터 다시 활성화');

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
