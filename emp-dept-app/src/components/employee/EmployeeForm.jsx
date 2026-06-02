import { useState, useEffect } from 'react';
import useDepartmentStore from '../../store/departmentStore';

function EmployeeForm({ initialData, onSubmit, isEditMode }) {
  const { departments, fetchDepartments } = useDepartmentStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
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
    // <select> value는 문자열이므로 Number로 변환 후 전송
    onSubmit({ ...formData, departmentId: Number(formData.departmentId) });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서</label>
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">-- 부서 선택 --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.departmentName}</option>
          ))}
        </select>
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

export default EmployeeForm;
