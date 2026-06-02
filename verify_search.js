const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const SS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR);
const ss = (name) => path.join(SS_DIR, `search_${name}.png`);
const results = [];

function log(icon, msg, detail = '') {
  const line = `${icon} ${msg}${detail ? ' → ' + detail : ''}`;
  console.log(line);
  results.push(line);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE}/employees`, { waitUntil: 'networkidle' });

    // ── 1. 검색 바 UI 확인 ─────────────────────────────────
    console.log('\n=== 1. 검색 바 UI ===');
    const searchInput = page.locator('input[placeholder*="이메일로 직원 검색"]');
    const searchBtn   = page.locator('button:has-text("검색")');
    log(await searchInput.isVisible() ? '✅' : '❌', '검색 입력창 표시');
    log(await searchBtn.isVisible()   ? '✅' : '❌', '검색 버튼 표시');
    await page.screenshot({ path: ss('01_initial') });

    // ── 2. 존재하는 이메일 검색 ────────────────────────────
    console.log('\n=== 2. 정상 이메일 검색 ===');
    await searchInput.fill('John@company.com');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('02_found') });

    const foundCard  = page.locator('text=John Smith');
    const resultMsg  = page.locator('text=검색 결과');
    const clearBtn   = page.locator('button:has-text("초기화")');
    log(await foundCard.isVisible()  ? '✅' : '❌', 'John Smith 카드 표시');
    log(await resultMsg.isVisible()  ? '✅' : '❌', '검색 결과 라벨 표시');
    log(await clearBtn.isVisible()   ? '✅' : '❌', '초기화 버튼 표시');

    // 검색 결과에서 전체 목록 숨김 확인
    const fullListCards = await page.locator('.bg-white.rounded-lg.shadow').count();
    log(fullListCards === 1 ? '✅' : '⚠️', `검색 결과만 표시 (카드 수)`, fullListCards);

    // ── 3. 존재하지 않는 이메일 검색 ──────────────────────
    console.log('\n=== 3. 없는 이메일 검색 ===');
    await searchInput.fill('nobody@company.com');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: ss('03_notfound') });

    const notFoundMsg = page.locator('text=찾을 수 없습니다');
    log(await notFoundMsg.isVisible() ? '✅' : '❌', '미존재 이메일 → 안내 메시지 표시');

    // ── 4. 검색 중 버튼 텍스트 변경 확인 ──────────────────
    console.log('\n=== 4. 검색 중 상태 ===');
    await searchInput.fill('Sarah@company.com');
    // 클릭 즉시 캡처
    await searchBtn.click();
    // 검색 완료 대기
    await page.waitForTimeout(800);
    const sarahVisible = await page.locator('text=Sarah Johnson').isVisible();
    log(sarahVisible ? '✅' : '❌', 'Sarah Johnson 검색 성공');
    await page.screenshot({ path: ss('04_sarah') });

    // ── 5. 초기화 버튼 → 전체 목록 복원 ──────────────────
    console.log('\n=== 5. 초기화 ===');
    await clearBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: ss('05_cleared') });

    const allCards   = await page.locator('.bg-white.rounded-lg.shadow').count();
    const inputVal   = await searchInput.inputValue();
    const noClearBtn = !(await page.locator('button:has-text("초기화")').isVisible());
    log(allCards > 1    ? '✅' : '❌', `초기화 후 전체 목록 복원`, `${allCards}개 카드`);
    log(inputVal === '' ? '✅' : '❌', '검색 입력창 초기화');
    log(noClearBtn      ? '✅' : '❌', '초기화 버튼 사라짐');

    // ── 6. 검색 결과 카드에서 삭제 후 초기화 ───────────────
    console.log('\n=== 6. 검색 결과 카드 삭제 후 초기화 ===');
    await searchInput.fill('Mike@company.com');
    await searchBtn.click();
    await page.waitForTimeout(1000);
    const mikeVisible = await page.locator('text=Mike Brown').isVisible();
    log(mikeVisible ? '✅' : '❌', 'Mike Brown 검색 확인');

    page.on('dialog', d => d.accept());
    await page.locator('button:has-text("삭제")').click();
    await page.waitForTimeout(500);
    // 삭제 후 검색 초기화되어 전체 목록으로 돌아와야 함
    const afterDeleteCards = await page.locator('.bg-white.rounded-lg.shadow').count();
    const backToList = !(await page.locator('text=검색 결과').isVisible().catch(() => false));
    log(backToList ? '✅' : '❌', '검색 결과 카드 삭제 후 목록 초기화');
    await page.screenshot({ path: ss('06_delete_result') });

  } catch (err) {
    console.error('오류:', err.message);
    await page.screenshot({ path: ss('error') });
    results.push(`❌ 예외: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n=== 결과 요약 ===');
  results.forEach(r => console.log(r));
  const fails = results.filter(r => r.startsWith('❌')).length;
  console.log(`\n총 ${results.length}개 | ❌ ${fails}개 실패`);
  process.exit(fails > 0 ? 1 : 0);
})();
