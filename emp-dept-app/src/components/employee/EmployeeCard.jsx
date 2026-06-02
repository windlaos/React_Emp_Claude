import { useNavigate } from 'react-router';

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
