import { useNavigate } from 'react-router';

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
