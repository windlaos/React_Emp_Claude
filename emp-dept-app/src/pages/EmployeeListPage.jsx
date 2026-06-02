import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useEmployeeStore from '../store/employeeStore';
import useDepartmentStore from '../store/departmentStore';
import { getEmployeeByEmail } from '../api/employeeApi';
import EmployeeCard from '../components/employee/EmployeeCard';

// 검색 상태 상수
const SEARCH_STATE = { IDLE: 'idle', SEARCHING: 'searching', FOUND: 'found', NOT_FOUND: 'notfound' };

function EmployeeListPage() {
  const navigate = useNavigate();
  const { employees, isLoading, error, fetchEmployees, deleteEmployee } =
    useEmployeeStore();
  const { departments, fetchDepartments } = useDepartmentStore();

  const [searchEmail, setSearchEmail]   = useState('');
  const [searchState, setSearchState]   = useState(SEARCH_STATE.IDLE);
  const [searchResult, setSearchResult] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');  // '' = 전체

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // 부서 필터가 적용된 직원 목록 (검색 비활성 상태에서만 사용)
  const filteredEmployees = selectedDeptId
    ? employees.filter((emp) => emp.department?.id === Number(selectedDeptId))
    : employees;

  const handleSearch = async (e) => {
    e.preventDefault();
    const email = searchEmail.trim();
    if (!email) return;

    setSearchState(SEARCH_STATE.SEARCHING);
    setSearchResult(null);
    try {
      const res = await getEmployeeByEmail(email);
      // 스토어의 employees는 department 객체를 포함하므로 매칭해서 사용
      const { employees: storeEmps } = useEmployeeStore.getState();
      const enriched = storeEmps.find((e) => e.id === res.data.id) ?? res.data;
      setSearchResult(enriched);
      setSearchState(SEARCH_STATE.FOUND);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchState(SEARCH_STATE.NOT_FOUND);
      } else {
        toast.error('검색 중 오류가 발생했습니다.');
        setSearchState(SEARCH_STATE.IDLE);
      }
    }
  };

  const handleClear = () => {
    setSearchEmail('');
    setSearchResult(null);
    setSearchState(SEARCH_STATE.IDLE);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteEmployee(id);
        toast.success('직원이 삭제되었습니다.');
        if (searchResult?.id === id) handleClear();
      } catch {
        toast.error('직원 삭제에 실패했습니다.');
      }
    }
  };

  if (isLoading) return <p className="text-center mt-10">로딩 중...</p>;
  if (error)     return <p className="text-red-500 text-center mt-10">{error}</p>;

  const isSearchActive = searchState !== SEARCH_STATE.IDLE;

  return (
    <div>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">직원 목록</h1>
        <button
          onClick={() => navigate('/employees/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + 직원 등록
        </button>
      </div>

      {/* 필터 + 검색 바 */}
      <div className="flex flex-col gap-3 mb-6">
        {/* 부서 필터 드롭다운 */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600 shrink-0">부서 필터</label>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            disabled={isSearchActive}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">전체 ({employees.length}명)</option>
            {departments.map((dept) => {
              const count = employees.filter(
                (emp) => emp.department?.id === dept.id
              ).length;
              return (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName} ({count}명)
                </option>
              );
            })}
          </select>
          {selectedDeptId && !isSearchActive && (
            <button
              type="button"
              onClick={() => setSelectedDeptId('')}
              className="text-sm text-indigo-600 hover:underline"
            >
              필터 해제
            </button>
          )}
        </div>

        {/* 이메일 검색 바 */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="이메일로 직원 검색..."
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={searchState === SEARCH_STATE.SEARCHING}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {searchState === SEARCH_STATE.SEARCHING ? '검색 중...' : '검색'}
          </button>
          {isSearchActive && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {/* 검색 결과 영역 */}
      {isSearchActive && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">
            "{searchEmail.trim()}" 검색 결과
          </p>
          {searchState === SEARCH_STATE.FOUND && searchResult && (
            <EmployeeCard employee={searchResult} onDelete={handleDelete} />
          )}
          {searchState === SEARCH_STATE.NOT_FOUND && (
            <p className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
              해당 이메일의 직원을 찾을 수 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 필터링된 전체 목록 (검색 비활성 시) */}
      {!isSearchActive && (
        <>
          {selectedDeptId && (
            <p className="text-sm text-gray-500 mb-3">
              {departments.find((d) => d.id === Number(selectedDeptId))?.departmentName} 부서 —{' '}
              {filteredEmployees.length}명
            </p>
          )}
          {filteredEmployees.length === 0 ? (
            <p className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
              해당 부서에 등록된 직원이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredEmployees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EmployeeListPage;
