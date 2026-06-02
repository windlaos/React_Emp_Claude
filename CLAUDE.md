# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

직원(Employee)·부서(Department) CRUD SPA. 백엔드는 이미 존재하며(`backend/`), 프론트엔드는 PRD 문서(`PRD_EmpDept_Frontend.md`)를 따라 `emp-dept-app/` 디렉터리에 새로 구축한다.

---

## 명령어

### 백엔드 실행

```bash
cd backend
npm start        # nodemon emp_dept.js → http://localhost:8080
```

### 프론트엔드 (emp-dept-app/ 생성 후)

```bash
cd emp-dept-app
npm run dev      # Vite 개발 서버 → http://localhost:5173
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과물 미리보기
```

---

## 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 백엔드 | Node.js + Express 4 | 포트 8080, 인메모리 저장소 |
| 프론트엔드 | React 19 + Vite 8 | 포트 5173 |
| 상태 관리 | Zustand 5 | `src/store/` |
| 라우팅 | React Router 7 | `createBrowserRouter` (import: `"react-router"` 또는 `"react-router-dom"`) |
| 스타일 | Tailwind CSS 4 | `@tailwindcss/vite` 플러그인 방식, `tailwind.config.js` 없음 |
| HTTP | Axios 1.16 | baseURL `http://localhost:8080/api` |

---

## 아키텍처

### 데이터 흐름

```
백엔드 (Express, :8080)
    ↕  HTTP (Axios)
src/api/          ← axiosInstance + departmentApi / employeeApi
    ↕  함수 호출
src/store/        ← Zustand (departmentStore / employeeStore)
    ↕  훅 구독
src/pages/ + src/components/
```

### 백엔드 핵심 제약사항

- **인메모리 저장소**: 서버 재시작 시 모든 데이터가 초기값(부서 3개, 직원 3개)으로 리셋된다.
- 라우트 등록 순서 주의: `/api/employees/departments`와 `/api/employees/email/:email`은 반드시 `/api/employees/:id`보다 먼저 등록되어야 한다 (현재 `emp_dept.js`에 이미 반영됨).
- 부서 수정은 `PATCH`, 직원 수정은 `PUT` 메서드를 사용한다 (둘이 다름).

### 프론트엔드 폴더 구조

```
emp-dept-app/src/
├── api/
│   ├── axiosInstance.js      # 공통 Axios 인스턴스
│   ├── departmentApi.js      # 부서 API 함수
│   └── employeeApi.js        # 직원 API 함수
├── store/
│   ├── departmentStore.js    # Zustand 부서 스토어
│   └── employeeStore.js      # Zustand 직원 스토어
├── pages/                    # 라우트 단위 페이지 컴포넌트
├── components/
│   ├── layout/               # Layout, NavBar
│   ├── department/           # DepartmentCard, DepartmentForm
│   └── employee/             # EmployeeCard, EmployeeForm
├── App.jsx                   # createBrowserRouter 설정
└── main.jsx
```

### 라우팅 구조

`App.jsx`에서 `createBrowserRouter`로 중첩 라우트를 구성하며, 루트(`/`)에 `Layout`을 배치하고 `Outlet`으로 하위 페이지를 렌더링한다.

| 경로 | 컴포넌트 |
|------|---------|
| `/` | `HomePage` (대시보드) |
| `/departments` | `DepartmentListPage` |
| `/departments/new` | `DepartmentFormPage` |
| `/departments/:id/edit` | `DepartmentFormPage` |
| `/employees` | `EmployeeListPage` |
| `/employees/new` | `EmployeeFormPage` |
| `/employees/:id/edit` | `EmployeeFormPage` |

### Zustand 스토어 패턴

두 스토어 모두 `{ 데이터배열, isLoading, error, fetch/add/update/delete 액션 }` 구조를 따른다. `fetchEmployees`는 `/api/employees/departments` 엔드포인트를 호출해 부서 정보가 포함된 직원 목록을 가져온다.

### EmployeeForm의 departmentId 처리

직원 폼에서 부서 드롭다운(`<select>`)의 `value`는 문자열이므로, submit 시 `Number(formData.departmentId)`로 형변환하여 전송해야 한다. 수정 모드 초기값은 `initialData.department?.id`에서 가져온다.

---

## 새 기술 사용 지침

라이브러리 API 사용 시 **반드시 `use context7`** 로 최신 공식 문서를 먼저 확인한 후 구현한다.

## PRD 문서와 CLAUDE.md 문서 항상 최신화 규칙
* @PRD_EmpDept_Frontend.md의 각 단계(Phase)가 완료되면 Checkbox에 x를 표시하여 완료되었음을 표시한다.
* 소스 코드가 변경되거나 라이브러리 버전이 변경되면 반드시 문셔에도 md 문서도 반드시 업데이트 하세요.