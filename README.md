# EmpManager — 직원·부서 관리 SPA

사내 직원(Employee)과 부서(Department) 데이터를 관리하는 싱글 페이지 웹 애플리케이션입니다.  
Node.js/Express REST API 백엔드와 React 프론트엔드로 구성된 풀스택 프로젝트입니다.

---

## 기술 스택

### 백엔드
| 항목 | 기술 |
|------|------|
| 런타임 | Node.js 18+ |
| 프레임워크 | Express 4 |
| 데이터 저장 | In-memory (서버 재시작 시 초기화) |
| 포트 | 8080 |

### 프론트엔드
| 항목 | 기술 | 버전 |
|------|------|------|
| UI 프레임워크 | React | 19.2 |
| 빌드 도구 | Vite | 8.0 |
| 스타일 | Tailwind CSS | 4.3 |
| 상태 관리 | Zustand | 5.0 |
| 라우팅 | React Router | 7.16 |
| HTTP 클라이언트 | Axios | 1.16 |
| 토스트 알림 | react-hot-toast | 2.6 |

---

## 프로젝트 구조

```
React_Emp_Claude/
├── backend/
│   ├── emp_dept.js          # Express REST API 서버
│   └── package.json
├── emp-dept-app/            # React 프론트엔드
│   ├── src/
│   │   ├── api/             # Axios 인스턴스 & API 함수
│   │   ├── components/
│   │   │   ├── common/      # Pagination
│   │   │   ├── department/  # DepartmentCard, DepartmentForm
│   │   │   ├── employee/    # EmployeeCard, EmployeeForm
│   │   │   └── layout/      # Layout, NavBar
│   │   ├── hooks/           # useDarkMode
│   │   ├── pages/           # 5개 페이지 컴포넌트
│   │   └── store/           # Zustand 스토어
│   └── package.json
├── CLAUDE.md                # Claude Code 프로젝트 지침
└── PRD_EmpDept_Frontend.md  # 제품 요구사항 문서
```

---

## 실행 방법

### 1. 백엔드 서버 실행

```bash
cd backend
npm install
npm start        # http://localhost:8080
```

### 2. 프론트엔드 개발 서버 실행

```bash
cd emp-dept-app
npm install
npm run dev      # http://localhost:5173
```

### 3. 프론트엔드 프로덕션 빌드

```bash
cd emp-dept-app
npm run build
npm run preview
```

---

## 주요 기능

### 부서 관리
- 부서 목록 조회 (페이지네이션)
- 부서 등록 / 수정 / 삭제
- 등록·수정 시 폼 유효성 검사 (필수 입력, 2자 이상)
- CRUD 성공/실패 토스트 알림

### 직원 관리
- 직원 목록 조회 (부서 정보 포함, 페이지네이션)
- 직원 등록 / 수정 / 삭제
- 이메일 형식 검사 + 중복 이메일 체크 (API 활용)
- 부서별 필터링
- 이메일로 직원 검색

### UI/UX
- 다크 모드 (NavBar 토글, `localStorage` 저장, 시스템 설정 자동 감지)
- 페이지네이션 (5 / 10 / 20개 선택)
- 대시보드 (총 부서 수 · 총 직원 수 카드)

---

## API 명세

### Department

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/departments` | 전체 부서 조회 |
| GET | `/api/departments/:id` | 단일 부서 조회 |
| POST | `/api/departments` | 부서 등록 |
| PATCH | `/api/departments/:id` | 부서 수정 |
| DELETE | `/api/departments/:id` | 부서 삭제 |

### Employee

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/employees` | 전체 직원 조회 |
| GET | `/api/employees/departments` | 직원 + 부서 정보 조회 |
| GET | `/api/employees/email/:email` | 이메일로 직원 검색 |
| POST | `/api/employees` | 직원 등록 |
| PUT | `/api/employees/:id` | 직원 수정 |
| DELETE | `/api/employees/:id` | 직원 삭제 |

---

## 화면 구성

| 경로 | 페이지 |
|------|--------|
| `/` | 대시보드 (부서 수 · 직원 수 카드) |
| `/departments` | 부서 목록 |
| `/departments/new` | 부서 등록 폼 |
| `/departments/:id/edit` | 부서 수정 폼 |
| `/employees` | 직원 목록 (부서 필터 · 이메일 검색) |
| `/employees/new` | 직원 등록 폼 |
| `/employees/:id/edit` | 직원 수정 폼 |

---

## 데이터 흐름

```
백엔드 (Express :8080)
    ↕  HTTP (Axios)
src/api/          axiosInstance + departmentApi / employeeApi
    ↕  함수 호출
src/store/        Zustand (departmentStore / employeeStore)
    ↕  훅 구독
src/pages/ + src/components/
```

---

## 개발 노트

- **백엔드 in-memory 저장**: 서버 재시작 시 데이터가 초기 3개 부서 / 3명 직원으로 초기화됩니다.
- **React Router v7**: `Link`, `Outlet`, `useNavigate`, `useParams` → `"react-router"` 임포트  
  `RouterProvider` → `"react-router/dom"` 임포트
- **Tailwind CSS v4 다크 모드**: `tailwind.config.js` 불필요, `@variant dark` CSS 설정 방식 사용
- **이메일 중복 체크**: 수정 모드에서 본인 이메일은 허용 (`currentEmployeeId` 비교)
