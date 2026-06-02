import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useEmployeeStore from '../store/employeeStore';
import { getEmployeeByEmail } from '../api/employeeApi';
import EmployeeCard from '../components/employee/EmployeeCard';

// 검색 상태 상수
const SEARCH_STATE = { IDLE: 'idle', SEARCHING: 'searching', FOUND: 'found', NOT_FOUND: 'notfound' };

function EmployeeListPage() {
  const navigate = useNavigate();
  const { employees, isLoading, error, fetchEmployees, deleteEmployee } =
    useEmployeeStore();

  const [searchEmail, setSearchEmail]   = useState('');
  const [searchState, setSearchState]   = useState(SEARCH_STATE.IDLE);
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

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
        // 삭제된 직원이 검색 결과였으면 검색 초기화
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

      {/* 이메일 검색 바 */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
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

      {/* 검색 결과 영역 */}
      {isSearchActive && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-3">
            "{searchEmail.trim()}" 검색 결과
          </p>
          {searchState === SEARCH_STATE.FOUND && searchResult && (
            <EmployeeCard
              employee={searchResult}
              onDelete={handleDelete}
            />
          )}
          {searchState === SEARCH_STATE.NOT_FOUND && (
            <p className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
              해당 이메일의 직원을 찾을 수 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 전체 목록 (검색 중이 아닐 때만 표시) */}
      {!isSearchActive && (
        <div className="flex flex-col gap-4">
          {employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeListPage;
