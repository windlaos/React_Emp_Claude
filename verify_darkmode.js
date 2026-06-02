const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const BASE   = 'http://localhost:5173';
const SS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR);
const ss = (n) => path.join(SS_DIR, `dark_${n}.png`);
const results = [];
function log(icon, msg, detail = '') {
  const line = `${icon} ${msg}${detail ? ' → ' + detail : ''}`;
  console.log(line);
  results.push(line);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    // ── 1. 라이트 모드 (기본) ────────────────────────────
    console.log('\n=== 1. 라이트 모드 기본 확인 ===');
    const page = await browser.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });

    const toggleBtn = page.locator('button[aria-label*="다크 모드"]');
    log(await toggleBtn.isVisible() ? '✅' : '❌', '다크 모드 토글 버튼 표시');

    const htmlClass = await page.evaluate(() => document.documentElement.className);
    log(!htmlClass.includes('dark') ? '✅' : '⚠️', '초기 라이트 모드', `class="${htmlClass}"`);
    await page.screenshot({ path: ss('01_light_home'), fullPage: true });

    // ── 2. 다크 모드 전환 ─────────────────────────────────
    console.log('\n=== 2. 다크 모드 전환 ===');
    await toggleBtn.click();
    await page.waitForTimeout(300);

    const darkClass = await page.evaluate(() => document.documentElement.className);
    log(darkClass.includes('dark') ? '✅' : '❌', '토글 후 html에 dark 클래스 추가', `class="${darkClass}"`);

    const sunBtn = page.locator('button[aria-label*="라이트 모드"]');
    log(await sunBtn.isVisible() ? '✅' : '❌', '다크 모드 시 태양 아이콘 표시');
    await page.screenshot({ path: ss('02_dark_home'), fullPage: true });

    // 배경색 검사 — dark:bg-gray-900 = oklch 값
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.min-h-screen')).backgroundColor
    );
    log(bgColor !== 'rgb(249, 250, 251)' ? '✅' : '❌', '배경색 다크로 변경', bgColor);

    // ── 3. 부서 목록 다크 ────────────────────────────────
    console.log('\n=== 3. 부서 목록 다크 모드 ===');
    await page.goto(`${BASE}/departments`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: ss('03_dark_dept_list'), fullPage: true });
    const deptCardBg = await page.evaluate(() => {
      const card = document.querySelector('.rounded-lg.shadow');
      return card ? getComputedStyle(card).backgroundColor : null;
    });
    log(deptCardBg && deptCardBg !== 'rgb(255, 255, 255)' ? '✅' : '❌',
      '부서 카드 다크 배경', deptCardBg);

    // ── 4. 직원 목록 다크 ────────────────────────────────
    console.log('\n=== 4. 직원 목록 다크 모드 ===');
    await page.goto(`${BASE}/employees`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: ss('04_dark_emp_list'), fullPage: true });

    // ── 5. 등록 폼 다크 ──────────────────────────────────
    console.log('\n=== 5. 폼 다크 모드 ===');
    await page.goto(`${BASE}/departments/new`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: ss('05_dark_form'), fullPage: true });
    const inputBg = await page.evaluate(() => {
      const input = document.querySelector('input[name="departmentName"]');
      return input ? getComputedStyle(input).backgroundColor : null;
    });
    log(inputBg && inputBg !== 'rgb(255, 255, 255)' ? '✅' : '❌',
      '입력 필드 다크 배경', inputBg);

    // ── 6. localStorage 저장 확인 ───────────────────────
    console.log('\n=== 6. 다크 모드 localStorage 저장 ===');
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    log(stored === 'dark' ? '✅' : '❌', 'localStorage theme=dark 저장', stored);

    // ── 7. 페이지 새로고침 후 다크 유지 ────────────────
    console.log('\n=== 7. 새로고침 후 다크 모드 유지 ===');
    await page.reload({ waitUntil: 'networkidle' });
    const afterReloadClass = await page.evaluate(() => document.documentElement.className);
    log(afterReloadClass.includes('dark') ? '✅' : '❌',
      '새로고침 후 다크 모드 유지', `class="${afterReloadClass}"`);
    await page.screenshot({ path: ss('07_dark_after_reload'), fullPage: true });

    // ── 8. 다시 라이트 모드 전환 ───────────────────────
    console.log('\n=== 8. 라이트 모드 복원 ===');
    const sunBtnAfter = page.locator('button[aria-label*="라이트 모드"]');
    await sunBtnAfter.click();
    await page.waitForTimeout(300);
    const lightClass = await page.evaluate(() => document.documentElement.className);
    log(!lightClass.includes('dark') ? '✅' : '❌', '라이트 모드 복원', `class="${lightClass}"`);
    const storedLight = await page.evaluate(() => localStorage.getItem('theme'));
    log(storedLight === 'light' ? '✅' : '❌', 'localStorage theme=light 저장', storedLight);
    await page.screenshot({ path: ss('08_light_restored'), fullPage: true });

  } catch (err) {
    console.error('오류:', err.message);
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
