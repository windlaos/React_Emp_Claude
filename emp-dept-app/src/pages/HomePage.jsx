import { useEffect } from 'react';
import { useNavigate } from 'react-router';
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
      <h1 className="text-2xl font-bold mb-8 dark:text-white">대시보드</h1>
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
