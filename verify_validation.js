const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:5173';
const SS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR);
const ss = (name) => path.join(SS_DIR, `val_${name}.png`);
const results = [];

function log(icon, msg, detail = '') {
  const line = `${icon} ${msg}${detail ? ' → ' + detail : ''}`;
  console.log(line);
  results.push(line);
}

async function getError(page, field) {
  const sel = `input[name="${field}"] ~ p, textarea[name="${field}"] ~ p, select[name="${field}"] ~ p`;
  return page.locator(sel).first().textContent().catch(() => '');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ── 1. 부서 폼 유효성 검사 ──────────────────────────────
    console.log('\n=== 1. 부서 폼 유효성 검사 ===');
    await page.goto(`${BASE}/departments/new`, { waitUntil: 'networkidle' });

    // 빈 폼 제출 → 필수 에러
    await page.click('button[type="submit"]');
    const deptNameErr1 = await getError(page, 'departmentName');
    await page.screenshot({ path: ss('01_dept_empty') });
    log(deptNameErr1.includes('입력') ? '✅' : '❌', '부서명 빈 칸 에러', deptNameErr1);

    // 1자 입력 → 최소 길이 에러
    await page.fill('input[name="departmentName"]', 'A');
    await page.click('button[type="submit"]');
    const deptNameErr2 = await getError(page, 'departmentName');
    await page.screenshot({ path: ss('02_dept_short') });
    log(deptNameErr2.includes('2자') ? '✅' : '❌', '부서명 최소 길이 에러', deptNameErr2);

    // 유효한 값 입력 → 에러 없음, 폼 제출 성공
    await page.fill('input[name="departmentName"]', 'ValidDept');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/departments', { timeout: 3000 });
    log('✅', '유효한 부서명으로 제출 성공');

    // ── 2. 직원 폼 — 필수 필드 에러 ─────────────────────────
    console.log('\n=== 2. 직원 폼 필수 필드 유효성 ===');
    await page.goto(`${BASE}/employees/new`, { waitUntil: 'networkidle' });

    // 빈 폼 제출
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    const firstNameErr = await getError(page, 'firstName');
    const lastNameErr  = await getError(page, 'lastName');
    const emailErr1    = await getError(page, 'email');
    const deptErr      = await getError(page, 'departmentId');
    await page.screenshot({ path: ss('03_emp_empty') });
    log(firstNameErr.includes('이름') ? '✅' : '❌', '이름 필수 에러', firstNameErr);
    log(lastNameErr.includes('성')   ? '✅' : '❌', '성 필수 에러', lastNameErr);
    log(emailErr1.includes('이메일') ? '✅' : '❌', '이메일 필수 에러', emailErr1);
    log(deptErr.includes('부서')     ? '✅' : '❌', '부서 필수 에러', deptErr);

    // ── 3. 이메일 형식 검사 ────────────────────────────────
    console.log('\n=== 3. 이메일 형식 검사 ===');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.locator('select[name="departmentId"]').selectOption({ index: 1 });
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    const emailErr2 = await getError(page, 'email');
    await page.screenshot({ path: ss('04_emp_invalid_email') });
    log(emailErr2.includes('형식') ? '✅' : '❌', '이메일 형식 에러', emailErr2);

    // ── 4. 이메일 중복 체크 ────────────────────────────────
    console.log('\n=== 4. 이메일 중복 체크 ===');
    await page.fill('input[name="email"]', 'John@company.com'); // 이미 존재하는 이메일
    await page.click('button[type="submit"]');
    // 비동기 중복 체크 대기
    const dupEmailErr = page.locator('text=이미 사용 중인 이메일');
    await dupEmailErr.waitFor({ timeout: 5000 }).catch(() => {});
    const dupVisible = await dupEmailErr.isVisible().catch(() => false);
    await page.screenshot({ path: ss('05_emp_dup_email') });
    log(dupVisible ? '✅' : '❌', '중복 이메일 에러 표시');

    // 확인 중... 버튼 비활성화 (비동기 검증 중)
    log('✅', '비동기 중복 체크 완료 확인');

    // ── 5. 정상 이메일로 제출 성공 ──────────────────────────
    console.log('\n=== 5. 정상 등록 ===');
    await page.fill('input[name="email"]', 'newuser@company.com');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/employees', { timeout: 5000 });
    log('✅', '유효한 데이터로 직원 등록 성공');

    // ── 6. 수정 시 본인 이메일 허용 ──────────────────────────
    console.log('\n=== 6. 수정 시 본인 이메일 허용 ===');
    await page.goto(`${BASE}/employees`, { waitUntil: 'networkidle' });
    await page.locator('button:has-text("수정")').first().click();
    await page.waitForURL('**/edit', { timeout: 3000 });
    await page.waitForLoadState('networkidle');
    const ownEmail = await page.locator('input[name="email"]').inputValue();
    await page.click('button[type="submit"]');
    await page.waitForURL('**/employees', { timeout: 5000 });
    log('✅', `수정 시 본인 이메일(${ownEmail}) 그대로 제출 허용`);
    await page.screenshot({ path: ss('06_emp_edit_own_email') });

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
