import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useEmployeeStore from '../store/employeeStore';
import EmployeeCard from '../components/employee/EmployeeCard';

function EmployeeListPage() {
  const navigate = useNavigate();
  const { employees, isLoading, error, fetchEmployees, deleteEmployee } =
    useEmployeeStore();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteEmployee(id);
        toast.success('직원이 삭제되었습니다.');
      } catch {
        toast.error('직원 삭제에 실패했습니다.');
      }
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
        {employees.map((emp) => (
          <EmployeeCard key={emp.id} employee={emp} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default EmployeeListPage;
