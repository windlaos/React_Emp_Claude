# PRD: Employee & Department Management Frontend Application

> **버전:** 1.0.0  
> **작성일:** 2025-06-01  
> **대상 독자:** 개발자 (ReactJS 입문자)  
> **백엔드 API:** Node.js / Express (포트 8080)

---

## 1. 개요 (Overview)

### 1.1 제품 목적

사내 직원(Employee)과 부서(Department) 데이터를 관리하는 싱글 페이지 웹 애플리케이션(SPA)을 구축한다.  
기존 REST API 서버(`http://localhost:8080`)와 Axios로 통신하며, 사용자는 브라우저에서 CRUD(조회·등록·수정·삭제) 작업을 수행할 수 있다.

### 1.2 기술 스택

| 분류 | 기술 | 버전(권장) |
|------|------|-----------|
| 언어 | JavaScript (ES6+) | ES2022 |
| UI 프레임워크 | React | 18.x |
| 빌드 도구 | Vite | 5.x |
| 전역 상태 관리 | Zustand | 4.x |
| 클라이언트 라우팅 | React Router | 6.x |
| 스타일 | Tailwind CSS | 3.x |
| HTTP 통신 | Axios | 1.x |

### 1.3 바이브 코딩 원칙 적용 방침

> 이 PRD는 아래 세 가지 원칙을 준수하여 작성되었습니다.

| 원칙 | 적용 방법 |
|------|----------|
| **"뭘 만들면 완료인지" 체크리스트 미리 작성** | 각 단계 끝에 ✅ 완료 기준(Done Criteria)을 명시 |
| **새로운 기술: 조사 먼저, 구현 나중** | 각 단계 시작 전 공식 문서 링크 및 확인 사항 제공 |
| **버그: 분석 먼저, 수정 나중** | 각 단계에 예상 오류와 원인 분석 체크리스트 포함 |

---

## 2. 백엔드 API 명세 요약

> 프론트엔드 개발 전, 백엔드 API가 정상 작동하는지 먼저 확인한다.

### 2.1 Department API

| Method | Endpoint | 설명 | 성공 응답 |
|--------|----------|------|-----------|
| GET | `/api/departments` | 전체 부서 조회 | 200 + 배열 |
| GET | `/api/departments/:id` | 단일 부서 조회 | 200 + 객체 |
| POST | `/api/departments` | 부서 등록 | 201 + 생성된 객체 |
| PATCH | `/api/departments/:id` | 부서 수정 | 200 + 수정된 객체 |
| DELETE | `/api/departments/:id` | 부서 삭제 | 200 + 메시지 |

**부서 객체 스키마**
```json
{
  "id": 1,
  "departmentName": "HR",
  "departmentDescription": "performs human resource management functions"
}
```

### 2.2 Employee API

| Method | Endpoint | 설명 | 성공 응답 |
|--------|----------|------|-----------|
| GET | `/api/employees` | 전체 직원 조회 | 200 + 배열 |
| GET | `/api/employees/departments` | 직원 + 부서 정보 조회 | 200 + 배열 |
| GET | `/api/employees/email/:email` | 이메일로 직원 조회 | 200 + 객체 |
| POST | `/api/employees` | 직원 등록 | 201 + 생성된 객체 |
| PUT | `/api/employees/:id` | 직원 수정 | 200 + 수정된 객체 |
| DELETE | `/api/employees/:id` | 직원 삭제 | 200 + 메시지 |

**직원 객체 스키마 (departments 포함 버전)**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Smith",
  "email": "John@company.com",
  "department": {
    "id": 1,
    "departmentName": "HR",
    "departmentDescription": "..."
  }
}
```

---

## 3. 화면 구성 및 라우팅

### 3.1 페이지 목록

| 경로 | 컴포넌트명 | 설명 |
|------|-----------|------|
| `/` | `HomePage` | 대시보드 (직원 수·부서 수 요약) |
| `/departments` | `DepartmentListPage` | 부서 목록 + 등록 버튼 |
| `/departments/new` | `DepartmentFormPage` | 부서 등록 폼 |
| `/departments/:id/edit` | `DepartmentFormPage` | 부서 수정 폼 |
| `/employees` | `EmployeeListPage` | 직원 목록 (부서명 포함) + 등록 버튼 |
| `/employees/new` | `EmployeeFormPage` | 직원 등록 폼 |
| `/employees/:id/edit` | `EmployeeFormPage` | 직원 수정 폼 |

### 3.2 공통 레이아웃

```
┌──────────────────────────────────────────────┐
│  NavBar (로고 + 메뉴: Home / Departments / Employees) │
├──────────────────────────────────────────────┤
│                                              │
│  <Outlet />  ← 각 페이지가 렌더링되는 영역        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 4. 컴포넌트 트리

```
App
├── Layout
│   ├── NavBar
│   └── Outlet
│       ├── HomePage
│       ├── DepartmentListPage
│       │   └── DepartmentCard (×n)
│       ├── DepartmentFormPage
│       │   └── DepartmentForm
│       ├── EmployeeListPage
│       │   └── EmployeeCard (×n)
│       └── EmployeeFormPage
│           └── EmployeeForm
```

---

## 5. Zustand 스토어 설계

### 5.1 departmentStore

```js
// src/store/departmentStore.js
{
  departments: [],          // 부서 배열
  isLoading: false,         // 로딩 상태
  error: null,              // 에러 메시지

  fetchDepartments: async () => {},
  addDepartment:    async (data) => {},
  updateDepartment: async (id, data) => {},
  deleteDepartment: async (id) => {},
}
```

### 5.2 employeeStore

```js
// src/store/employeeStore.js
{
  employees: [],            // 직원 배열 (부서 포함)
  isLoading: false,
  error: null,

  fetchEmployees: async () => {},
  addEmployee:    async (data) => {},
  updateEmployee: async (id, data) => {},
  deleteEmployee: async (id) => {},
}
```

---

## 6. Axios 인스턴스 설계

```js
// src/api/axiosInstance.js
baseURL: 'http://localhost:8080/api'
timeout: 5000
headers: { 'Content-Type': 'application/json' }
```

---

## 7. 폴더 구조

```
emp-dept-app/
├── public/
├── src/
│   ├── api/
│   │   ├── axiosInstance.js      # Axios 공통 설정
│   │   ├── departmentApi.js      # 부서 API 함수
│   │   └── employeeApi.js        # 직원 API 함수
│   ├── store/
│   │   ├── departmentStore.js    # Zustand 부서 스토어
│   │   └── employeeStore.js      # Zustand 직원 스토어
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DepartmentListPage.jsx
│   │   ├── DepartmentFormPage.jsx
│   │   ├── EmployeeListPage.jsx
│   │   └── EmployeeFormPage.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx
│   │   │   └── NavBar.jsx
│   │   ├── department/
│   │   │   ├── DepartmentCard.jsx
│   │   │   └── DepartmentForm.jsx
│   │   └── employee/
│   │       ├── EmployeeCard.jsx
│   │       └── EmployeeForm.jsx
│   ├── App.jsx                   # 라우터 설정
│   └── main.jsx                  # 진입점
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 8. 구현 단계별 계획

> 각 단계는 독립적으로 완료 가능하도록 설계되었습니다.  
> 단계를 건너뛰지 말고 순서대로 진행하세요.

---

### Phase 0 — 사전 환경 확인

> **조사 먼저, 구현 나중** 원칙 적용

**확인 사항:**
- [ ] Node.js 18+ 설치 여부 확인: `node -v`
- [ ] npm 9+ 설치 여부 확인: `npm -v`
- [ ] 백엔드 서버 실행 확인: `node emp_dept.js` 후 `http://localhost:8080/api/departments` 브라우저 접속
- [ ] 공식 문서 북마크:
  - Vite: https://vitejs.dev/guide/
  - React Router v6: https://reactrouter.com/en/main/start/tutorial
  - Zustand: https://zustand.docs.pmnd.rs/getting-started/introduction
  - Tailwind CSS v3: https://v3.tailwindcss.com/docs/installation

**✅ Phase 0 완료 기준:**
- 브라우저에서 `http://localhost:8080/api/departments`가 JSON 배열을 반환한다
- `node -v` 결과가 18 이상이다

---

### Phase 1 — Vite + React 프로젝트 생성

**목표:** 빌드가 되는 빈 React 앱을 만든다

**작업 순서:**

```bash
# 1. 프로젝트 생성
npm create vite@latest emp-dept-app -- --template react

# 2. 디렉터리 이동
cd emp-dept-app

# 3. 기본 패키지 설치
npm install

# 4. 개발 서버 실행 확인
npm run dev
```

**✅ Phase 1 완료 기준:**
- `http://localhost:5173` 접속 시 Vite 기본 화면이 보인다
- 터미널에 에러가 없다

**⚠️ 예상 오류 및 분석 체크리스트:**

| 증상 | 원인 분석 순서 |
|------|--------------|
| `npm create vite` 명령 실패 | ① npm 버전 확인 (`npm -v`) → ② 인터넷 연결 확인 |
| 포트 5173 충돌 | ① 다른 터미널에서 이미 실행 중인지 확인 → ② `vite.config.js`에서 포트 변경 |

---

### Phase 2 — Tailwind CSS 설치 및 설정

**목표:** Tailwind 유틸리티 클래스가 스타일로 적용된다

> **조사 먼저:** https://v3.tailwindcss.com/docs/guides/vite

**작업 순서:**

```bash
# 1. Tailwind 관련 패키지 설치
npm install -D tailwindcss postcss autoprefixer

# 2. 설정 파일 생성
npx tailwindcss init -p
```

`tailwind.config.js` 수정:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}
```

`src/index.css` 상단에 추가:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/main.jsx`에서 `index.css` import 확인:
```js
import './index.css'
```

`src/App.jsx`를 아래처럼 수정하여 테스트:
```jsx
function App() {
  return (
    <div className="bg-blue-500 text-white p-4 text-2xl">
      Tailwind 작동 확인
    </div>
  )
}
export default App
```

**✅ Phase 2 완료 기준:**
- 브라우저에서 파란 배경 + 흰 텍스트가 보인다

**⚠️ 예상 오류 및 분석 체크리스트:**

| 증상 | 원인 분석 순서 |
|------|--------------|
| Tailwind 클래스가 적용 안 됨 | ① `tailwind.config.js`의 `content` 경로 확인 → ② `index.css`에 3줄 지시어 있는지 확인 → ③ `main.jsx`에서 `index.css` import 여부 확인 |

---

### Phase 3 — 추가 패키지 설치

**목표:** 프로젝트에 필요한 모든 라이브러리를 한 번에 설치한다

```bash
npm install react-router-dom zustand axios
```

설치 후 확인:
```bash
# package.json의 dependencies에 아래 항목이 있어야 함
# "axios": "^1.x.x"
# "react-router-dom": "^6.x.x"
# "zustand": "^4.x.x"
```

**✅ Phase 3 완료 기준:**
- `package.json`에 3개 패키지가 모두 등록되어 있다
- `npm run dev` 실행 시 오류가 없다

---

### Phase 4 — 폴더 구조 생성

**목표:** 섹션 7의 폴더 구조대로 빈 파일/폴더를 만든다

```bash
mkdir -p src/api src/store src/pages src/components/layout src/components/department src/components/employee

# 빈 파일 생성 (Windows: type nul > 파일명)
touch src/api/axiosInstance.js src/api/departmentApi.js src/api/employeeApi.js
touch src/store/departmentStore.js src/store/employeeStore.js
touch src/pages/HomePage.jsx src/pages/DepartmentListPage.jsx src/pages/DepartmentFormPage.jsx
touch src/pages/EmployeeListPage.jsx src/pages/EmployeeFormPage.jsx
touch src/components/layout/Layout.jsx src/components/layout/NavBar.jsx
touch src/components/department/DepartmentCard.jsx src/components/department/DepartmentForm.jsx
touch src/components/employee/EmployeeCard.jsx src/components/employee/EmployeeForm.jsx
```

**✅ Phase 4 완료 기준:**
- `src/` 하위 폴더 구조가 섹션 7과 일치한다
- 파일이 모두 존재한다 (내용은 비어 있어도 됨)

---

### Phase 5 — Axios 인스턴스 및 API 함수 작성

**목표:** 백엔드와 통신하는 함수들을 API 레이어로 분리한다

> **조사 먼저:** https://axios-http.com/docs/instance

#### 5-1. `src/api/axiosInstance.js`

```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
```

#### 5-2. `src/api/departmentApi.js`

```js
import axiosInstance from './axiosInstance';

export const getDepartments    = ()        => axiosInstance.get('/departments');
export const getDepartmentById = (id)      => axiosInstance.get(`/departments/${id}`);
export const createDepartment  = (data)    => axiosInstance.post('/departments', data);
export const updateDepartment  = (id, data)=> axiosInstance.patch(`/departments/${id}`, data);
export const deleteDepartment  = (id)      => axiosInstance.delete(`/departments/${id}`);
```

#### 5-3. `src/api/employeeApi.js`

```js
import axiosInstance from './axiosInstance';

export const getEmployeesWithDept = ()         => axiosInstance.get('/employees/departments');
export const getEmployeeByEmail   = (email)    => axiosInstance.get(`/employees/email/${email}`);
export const createEmployee       = (data)     => axiosInstance.post('/employees', data);
export const updateEmployee       = (id, data) => axiosInstance.put(`/employees/${id}`, data);
export const deleteEmployee       = (id)       => axiosInstance.delete(`/employees/${id}`);
```

**✅ Phase 5 완료 기준:**
- 브라우저 콘솔에서 아래 코드를 실행했을 때 부서 배열이 출력된다:
  ```js
  import('./src/api/departmentApi.js').then(m => m.getDepartments().then(r => console.log(r.data)))
  ```
  *(이 확인은 Phase 6 이후 App에서 import하여 테스트해도 됨)*

**⚠️ 예상 오류 및 분석 체크리스트:**

| 증상 | 원인 분석 순서 |
|------|--------------|
| CORS 에러 | ① 백엔드 서버가 실행 중인지 확인 → ② `emp_dept.js`에 `app.use(cors())`가 있는지 확인 |
| Network Error | ① `baseURL`이 `http://localhost:8080/api`인지 확인 → ② 백엔드 포트가 8080인지 확인 |

---

### Phase 6 — Zustand 스토어 작성

**목표:** 전역 상태와 비동기 액션을 스토어로 관리한다

> **조사 먼저:** https://zustand.docs.pmnd.rs/guides/updating-state

#### 6-1. `src/store/departmentStore.js`

```js
import { create } from 'zustand';
import {
  getDepartments, createDepartment,
  updateDepartment, deleteDepartment
} from '../api/departmentApi';

const useDepartmentStore = create((set) => ({
  departments: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getDepartments();
      set({ departments: res.data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addDepartment: async (data) => {
    const res = await createDepartment(data);
    set((state) => ({ departments: [...state.departments, res.data] }));
  },

  updateDepartment: async (id, data) => {
    const res = await updateDepartment(id, data);
    set((state) => ({
      departments: state.departments.map(d => d.id === id ? res.data : d),
    }));
  },

  deleteDepartment: async (id) => {
    await deleteDepartment(id);
    set((state) => ({
      departments: state.departments.filter(d => d.id !== id),
    }));
  },
}));

export default useDepartmentStore;
```

#### 6-2. `src/store/employeeStore.js`

```js
import { create } from 'zustand';
import {
  getEmployeesWithDept, createEmployee,
  updateEmployee, deleteEmployee
} from '../api/employeeApi';

const useEmployeeStore = create((set) => ({
  employees: [],
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getEmployeesWithDept();
      set({ employees: res.data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEmployee: async (data) => {
    const res = await createEmployee(data);
    set((state) => ({ employees: [...state.employees, res.data] }));
  },

  updateEmployee: async (id, data) => {
    const res = await updateEmployee(id, data);
    set((state) => ({
      employees: state.employees.map(e => e.id === id ? res.data : e),
    }));
  },

  deleteEmployee: async (id) => {
    await deleteEmployee(id);
    set((state) => ({
      employees: state.employees.filter(e => e.id !== id),
    }));
  },
}));

export default useEmployeeStore;
```

**✅ Phase 6 완료 기준:**
- 파일에 문법 오류 없이 저장된다
- `npm run dev` 실행 시 콘솔 오류가 없다

---

### Phase 7 — React Router 설정 및 레이아웃 컴포넌트

**목표:** URL에 따라 다른 페이지가 렌더링된다

> **조사 먼저:** https://reactrouter.com/en/main/components/outlet

#### 7-1. `src/components/layout/NavBar.jsx`

```jsx
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex gap-6 items-center">
      <Link to="/" className="font-bold text-lg mr-4">EmpManager</Link>
      <Link to="/departments" className="hover:text-indigo-200">Departments</Link>
      <Link to="/employees" className="hover:text-indigo-200">Employees</Link>
    </nav>
  );
}

export default NavBar;
```

#### 7-2. `src/components/layout/Layout.jsx`

```jsx
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
```

#### 7-3. 각 페이지 파일에 임시 내용 추가

아래 내용을 각 페이지 파일에 붙여넣는다 (나중에 교체):

```jsx
// 예: src/pages/HomePage.jsx
function HomePage() {
  return <h1 className="text-2xl font-bold">홈 페이지</h1>;
}
export default HomePage;
```

나머지 페이지도 같은 패턴으로 임시 내용 작성:
- `DepartmentListPage` → `<h1>부서 목록</h1>`
- `DepartmentFormPage` → `<h1>부서 폼</h1>`
- `EmployeeListPage` → `<h1>직원 목록</h1>`
- `EmployeeFormPage` → `<h1>직원 폼</h1>`

#### 7-4. `src/App.jsx`

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DepartmentListPage from './pages/DepartmentListPage';
import DepartmentFormPage from './pages/DepartmentFormPage';
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeFormPage from './pages/EmployeeFormPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,              element: <HomePage /> },
      { path: 'departments',      element: <DepartmentListPage /> },
      { path: 'departments/new',  element: <DepartmentFormPage /> },
      { path: 'departments/:id/edit', element: <DepartmentFormPage /> },
      { path: 'employees',        element: <EmployeeListPage /> },
      { path: 'employees/new',    element: <EmployeeFormPage /> },
      { path: 'employees/:id/edit',   element: <EmployeeFormPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

**✅ Phase 7 완료 기준:**
- NavBar의 링크 클릭 시 URL이 변경된다
- 각 URL에서 해당 임시 페이지 제목이 보인다
- 새로고침(F5) 시 현재 페이지가 유지된다

---

### Phase 8 — 부서 목록 페이지 구현

**목표:** 부서 목록을 API에서 가져와 카드 형태로 표시하고 삭제할 수 있다

#### 8-1. `src/components/department/DepartmentCard.jsx`

```jsx
import { useNavigate } from 'react-router-dom';

function DepartmentCard({ department, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-4 flex justify-between items-start">
      <div>
        <h2 className="text-lg font-semibold text-indigo-700">{department.departmentName}</h2>
        <p className="text-gray-500 text-sm mt-1">{department.departmentDescription}</p>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <button
          onClick={() => navigate(`/departments/${department.id}/edit`)}
          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(department.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default DepartmentCard;
```

#### 8-2. `src/pages/DepartmentListPage.jsx`

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDepartmentStore from '../store/departmentStore';
import DepartmentCard from '../components/department/DepartmentCard';

function DepartmentListPage() {
  const navigate = useNavigate();
  const { departments, isLoading, error, fetchDepartments, deleteDepartment } = useDepartmentStore();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteDepartment(id);
    }
  };

  if (isLoading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error)     return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">부서 목록</h1>
        <button
          onClick={() => navigate('/departments/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + 부서 등록
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {departments.map(dept => (
          <DepartmentCard key={dept.id} department={dept} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default DepartmentListPage;
```

**✅ Phase 8 완료 기준:**
- `/departments` 접속 시 3개의 부서 카드가 보인다
- 삭제 버튼 클릭 후 confirm → 카드가 사라진다
- 새로고침 후 삭제된 항목이 복원된다 (백엔드가 in-memory 방식이므로 정상)

---

### Phase 9 — 부서 등록/수정 폼 구현

**목표:** 부서를 등록하고 수정할 수 있는 폼을 구현한다

> **조사 먼저:** React Router `useParams` → https://reactrouter.com/en/main/hooks/use-params

#### 9-1. `src/components/department/DepartmentForm.jsx`

```jsx
import { useState, useEffect } from 'react';

function DepartmentForm({ initialData, onSubmit, isEditMode }) {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentDescription: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서명</label>
        <input
          type="text"
          name="departmentName"
          value={formData.departmentName}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서 설명</label>
        <textarea
          name="departmentDescription"
          value={formData.departmentDescription}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <button
        type="submit"
        className="self-end px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        {isEditMode ? '수정 완료' : '등록'}
      </button>
    </form>
  );
}

export default DepartmentForm;
```

#### 9-2. `src/pages/DepartmentFormPage.jsx`

```jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useDepartmentStore from '../store/departmentStore';
import { getDepartmentById } from '../api/departmentApi';
import DepartmentForm from '../components/department/DepartmentForm';

function DepartmentFormPage() {
  const { id } = useParams();           // 수정 시 id가 있음
  const navigate = useNavigate();
  const { addDepartment, updateDepartment } = useDepartmentStore();
  const [initialData, setInitialData] = useState(null);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      getDepartmentById(id).then(res => setInitialData(res.data));
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    if (isEditMode) {
      await updateDepartment(Number(id), formData);
    } else {
      await addDepartment(formData);
    }
    navigate('/departments');
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? '부서 수정' : '부서 등록'}
      </h1>
      <DepartmentForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
      />
    </div>
  );
}

export default DepartmentFormPage;
```

**✅ Phase 9 완료 기준:**
- `/departments/new`에서 폼 작성 후 등록 → 목록 페이지로 이동, 새 항목이 보인다
- 목록에서 수정 버튼 클릭 → 폼에 기존 데이터가 채워진다
- 수정 후 저장 → 목록에서 변경된 내용이 반영된다

---

### Phase 10 — 직원 목록 페이지 구현

**목표:** 직원 목록을 부서 정보와 함께 표시하고 삭제할 수 있다

#### 10-1. `src/components/employee/EmployeeCard.jsx`

```jsx
import { useNavigate } from 'react-router-dom';

function EmployeeCard({ employee, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow p-4 flex justify-between items-start">
      <div>
        <h2 className="text-lg font-semibold">
          {employee.firstName} {employee.lastName}
        </h2>
        <p className="text-gray-500 text-sm">{employee.email}</p>
        <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
          {employee.department?.departmentName ?? '부서 없음'}
        </span>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <button
          onClick={() => navigate(`/employees/${employee.id}/edit`)}
          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-sm"
        >
          수정
        </button>
        <button
          onClick={() => onDelete(employee.id)}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

export default EmployeeCard;
```

#### 10-2. `src/pages/EmployeeListPage.jsx`

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmployeeStore from '../store/employeeStore';
import EmployeeCard from '../components/employee/EmployeeCard';

function EmployeeListPage() {
  const navigate = useNavigate();
  const { employees, isLoading, error, fetchEmployees, deleteEmployee } = useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteEmployee(id);
    }
  };

  if (isLoading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error)     return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">직원 목록</h1>
        <button
          onClick={() => navigate('/employees/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + 직원 등록
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {employees.map(emp => (
          <EmployeeCard key={emp.id} employee={emp} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default EmployeeListPage;
```

**✅ Phase 10 완료 기준:**
- `/employees` 접속 시 3명의 직원 카드가 보인다
- 각 카드에 부서 이름 뱃지가 표시된다
- 삭제가 정상 동작한다

---

### Phase 11 — 직원 등록/수정 폼 구현

**목표:** 직원 등록/수정 폼에서 부서를 드롭다운으로 선택한다

#### 11-1. `src/components/employee/EmployeeForm.jsx`

```jsx
import { useState, useEffect } from 'react';
import useDepartmentStore from '../../store/departmentStore';

function EmployeeForm({ initialData, onSubmit, isEditMode }) {
  const { departments, fetchDepartments } = useDepartmentStore();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', departmentId: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName:    initialData.firstName,
        lastName:     initialData.lastName,
        email:        initialData.email,
        departmentId: initialData.department?.id ?? '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, departmentId: Number(formData.departmentId) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input type="text" name="firstName" value={formData.firstName}
            onChange={handleChange} required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성</label>
          <input type="text" name="lastName" value={formData.lastName}
            onChange={handleChange} required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
        <input type="email" name="email" value={formData.email}
          onChange={handleChange} required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
        <select name="departmentId" value={formData.departmentId}
          onChange={handleChange} required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">-- 부서 선택 --</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.departmentName}</option>
          ))}
        </select>
      </div>
      <button type="submit"
        className="self-end px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
        {isEditMode ? '수정 완료' : '등록'}
      </button>
    </form>
  );
}

export default EmployeeForm;
```

#### 11-2. `src/pages/EmployeeFormPage.jsx`

```jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useEmployeeStore from '../store/employeeStore';
import EmployeeForm from '../components/employee/EmployeeForm';

function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, fetchEmployees, addEmployee, updateEmployee } = useEmployeeStore();
  const [initialData, setInitialData] = useState(null);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      fetchEmployees().then(() => {
        const emp = employees.find(e => e.id === Number(id));
        if (emp) setInitialData(emp);
      });
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    if (isEditMode) {
      await updateEmployee(Number(id), formData);
    } else {
      await addEmployee(formData);
    }
    navigate('/employees');
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? '직원 수정' : '직원 등록'}
      </h1>
      <EmployeeForm initialData={initialData} onSubmit={handleSubmit} isEditMode={isEditMode} />
    </div>
  );
}

export default EmployeeFormPage;
```

**✅ Phase 11 완료 기준:**
- 직원 등록 폼에서 부서 드롭다운이 정상 출력된다
- 등록 후 직원 목록으로 이동하고 새 직원이 보인다
- 수정 시 기존 정보가 폼에 채워진다

---

### Phase 12 — 홈 페이지 (대시보드) 구현

**목표:** 첫 화면에서 부서 수와 직원 수 요약 정보를 표시한다

#### `src/pages/HomePage.jsx`

```jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDepartmentStore from '../store/departmentStore';
import useEmployeeStore from '../store/employeeStore';

function StatCard({ title, count, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl shadow p-6 text-white ${color} hover:opacity-90 transition`}
    >
      <p className="text-sm opacity-80 mb-2">{title}</p>
      <p className="text-4xl font-bold">{count}</p>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { departments, fetchDepartments } = useDepartmentStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">대시보드</h1>
      <div className="grid grid-cols-2 gap-6">
        <StatCard
          title="총 부서 수"
          count={departments.length}
          color="bg-indigo-600"
          onClick={() => navigate('/departments')}
        />
        <StatCard
          title="총 직원 수"
          count={employees.length}
          color="bg-emerald-600"
          onClick={() => navigate('/employees')}
        />
      </div>
    </div>
  );
}

export default HomePage;
```

**✅ Phase 12 완료 기준:**
- 홈 화면에 부서 수(3)와 직원 수(3)가 카드로 표시된다
- 카드 클릭 시 해당 목록 페이지로 이동한다

---

### Phase 13 — 최종 통합 테스트

**목표:** 전체 기능이 정상 동작하는지 시나리오별로 검증한다

**테스트 시나리오 체크리스트:**

**부서 관리:**
- [ ] 홈에서 부서 카드 클릭 → 부서 목록 이동
- [ ] 부서 목록에서 3개 카드 확인
- [ ] 새 부서 등록 → 목록에 추가됨
- [ ] 부서 수정 → 변경된 이름 확인
- [ ] 부서 삭제 → 목록에서 제거됨

**직원 관리:**
- [ ] 직원 목록에서 3명 + 부서 뱃지 확인
- [ ] 새 직원 등록 (부서 선택 포함) → 목록 추가
- [ ] 직원 수정 → 변경 내용 반영
- [ ] 직원 삭제 → 목록에서 제거

**내비게이션:**
- [ ] NavBar 링크 모두 정상 이동
- [ ] 브라우저 뒤로가기 정상 동작
- [ ] URL 직접 입력(`/departments`)으로 페이지 접근 가능

**✅ Phase 13 완료 기준 = 전체 프로젝트 완료 기준:**
- 위 체크리스트 전 항목에 체크 완료
- 브라우저 콘솔에 빨간 에러 없음
- `npm run build` 성공

---

## 9. 비기능 요구사항

| 항목 | 내용 |
|------|------|
| 반응형 | 최소 1024px 이상 데스크탑 화면 지원 |
| 에러 처리 | API 실패 시 화면에 에러 메시지 표시 |
| 로딩 상태 | 데이터 요청 중 "로딩 중..." 텍스트 표시 |
| 삭제 확인 | `window.confirm`으로 실수 삭제 방지 |
| 접근성 | 모든 폼 입력 필드에 `label` 연결 |

---

## 10. 향후 개선 사항 (Backlog)

| 우선순위 | 기능 |
|---------|------|
| 높음 | 폼 유효성 검사 강화 (이메일 형식, 중복 이메일 등) |
| 높음 | 토스트 알림 (등록/수정/삭제 성공 메시지) |
| 중간 | 직원 목록 부서별 필터링 |
| 중간 | 직원 이메일 검색 기능 (`/api/employees/email/:email` 활용) |
| 낮음 | 다크 모드 지원 |
| 낮음 | 페이지네이션 |

---

*문서 끝*
