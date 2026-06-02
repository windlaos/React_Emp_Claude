// node, express 로 구성한 Employee/Department RESTful WebService
const express = require('express');
const cors = require('cors');
const port = 8080;
const app = express();

let nextDeptId = 4;
let nextEmpId  = 4;

let departments = [
  {
    id: 1,
    departmentName: 'HR',
    departmentDescription: 'performs human resource management functions'
  },
  {
    id: 2,
    departmentName: 'Marketing',
    departmentDescription: 'creates strategies for selling its company products'
  },
  {
    id: 3,
    departmentName: 'Sales',
    departmentDescription: 'identifies sales goals and objectives and prepares a sales plan'
  },
];

let employees = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'John@company.com',
    departmentId: 1
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'Sarah@company.com',
    departmentId: 2
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Brown',
    email: 'Mike@company.com',
    departmentId: 3
  },
];

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// ─── Department API ────────────────────────────────────────────────────────────

// 부서 전체 조회
app.get('/api/departments', (req, res) => {
  res.status(200).json(departments);
});

// 부서 1개 조회
app.get('/api/departments/:id', (req, res) => {
  const dept = departments.find(d => d.id == req.params.id);
  if (dept) {
    res.status(200).json(dept);
  } else {
    res.status(404).json({ msg: 'Department not found' });
  }
});

// 부서 등록
app.post('/api/departments', (req, res) => {
  const dept = { id: getNextDeptId(), ...req.body };
  departments = [...departments, dept];
  res.status(201).json(dept);
});

// 부서 수정
app.patch('/api/departments/:id', (req, res) => {
  const id = Number(req.params.id);
  const deptIndex = departments.findIndex(d => d.id === id);
  if (deptIndex > -1) {
    const dept = { ...departments[deptIndex], ...req.body };
    departments = [
      ...departments.slice(0, deptIndex),
      dept,
      ...departments.slice(deptIndex + 1),
    ];
    res.status(200).json(dept);
  } else {
    res.status(404).json({ msg: 'Department not found' });
  }
});

// 부서 삭제
app.delete('/api/departments/:id', (req, res) => {
  const id = Number(req.params.id);
  const deptIndex = departments.findIndex(d => d.id === id);
  if (deptIndex > -1) {
    departments.splice(deptIndex, 1);
    res.status(200).send('Department deleted successfully!.');
  } else {
    res.status(404).json({ msg: 'Department not found' });
  }
});

// ─── Employee API ──────────────────────────────────────────────────────────────

// 직원 전체 조회 (부서 정보 포함) — /:id 보다 먼저 등록해야 라우팅 충돌 방지
app.get('/api/employees/departments', (req, res) => {
  const result = employees.map(emp => {
    const dept = departments.find(d => d.id === emp.departmentId) || null;
    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: dept
    };
  });
  res.status(200).json(result);
});

// 이메일로 직원 조회 — /:id 보다 먼저 등록
app.get('/api/employees/email/:email', (req, res) => {
  const emp = employees.find(e => e.email === req.params.email);
  if (emp) {
    res.status(200).json(emp);
  } else {
    res.status(404).json({ msg: 'Employee not found' });
  }
});

// 직원 전체 조회
app.get('/api/employees', (req, res) => {
  res.status(200).json(employees);
});

// 직원 등록
app.post('/api/employees', (req, res) => {
  const emp = { id: getNextEmpId(), ...req.body };
  employees = [...employees, emp];
  res.status(201).json(emp);
});

// 직원 수정
app.put('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);
  const empIndex = employees.findIndex(e => e.id === id);
  if (empIndex > -1) {
    const emp = { ...employees[empIndex], ...req.body };
    employees = [
      ...employees.slice(0, empIndex),
      emp,
      ...employees.slice(empIndex + 1),
    ];
    res.status(200).json(emp);
  } else {
    res.status(404).json({ msg: 'Employee not found' });
  }
});

// 직원 삭제
app.delete('/api/employees/:id', (req, res) => {
  const id = Number(req.params.id);
  const empIndex = employees.findIndex(e => e.id === id);
  if (empIndex > -1) {
    employees.splice(empIndex, 1);
    res.status(200).send('Employee deleted successfully!.');
  } else {
    res.status(404).json({ msg: 'Employee not found' });
  }
});

// ─── 유틸 ──────────────────────────────────────────────────────────────────────

function getNextDeptId() {
  return nextDeptId++;
}

function getNextEmpId() {
  return nextEmpId++;
}

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
