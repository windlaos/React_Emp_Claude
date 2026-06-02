import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useDepartmentStore from '../store/departmentStore';
import DepartmentCard from '../components/department/DepartmentCard';

function DepartmentListPage() {
  const navigate = useNavigate();
  const { departments, isLoading, error, fetchDepartments, deleteDepartment } =
    useDepartmentStore();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteDepartment(id);
        toast.success('부서가 삭제되었습니다.');
      } catch {
        toast.error('부서 삭제에 실패했습니다.');
      }
    }
  };

  if (isLoading) return <p className="text-center mt-10 dark:text-gray-300">로딩 중...</p>;
  if (error)     return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">부서 목록</h1>
        <button
          onClick={() => navigate('/departments/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + 부서 등록
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {departments.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default DepartmentListPage;
