import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useDepartmentStore from '../store/departmentStore';
import DepartmentCard from '../components/department/DepartmentCard';
import Pagination from '../components/common/Pagination';

function DepartmentListPage() {
  const navigate = useNavigate();
  const { departments, isLoading, error, fetchDepartments, deleteDepartment } =
    useDepartmentStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(5);

  useEffect(() => {
    fetchDepartments();
  }, []);

  // 데이터 변경 시 1페이지로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [departments.length]);

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

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (isLoading) return <p className="text-center mt-10 dark:text-gray-300">로딩 중...</p>;
  if (error)     return <p className="text-red-500 text-center mt-10">{error}</p>;

  const totalPages    = Math.max(1, Math.ceil(departments.length / pageSize));
  const safePage      = Math.min(currentPage, totalPages);
  const paginated     = departments.slice((safePage - 1) * pageSize, safePage * pageSize);

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
        {paginated.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} onDelete={handleDelete} />
        ))}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={departments.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}

export default DepartmentListPage;
