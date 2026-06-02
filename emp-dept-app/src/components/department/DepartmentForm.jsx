import { useState, useEffect } from 'react';

function DepartmentForm({ initialData, onSubmit, isEditMode }) {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentDescription: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서명</label>
        <input
          type="text"
          name="departmentName"
          value={formData.departmentName}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서 설명</label>
        <textarea
          name="departmentDescription"
          value={formData.departmentDescription}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
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

export default DepartmentForm;
