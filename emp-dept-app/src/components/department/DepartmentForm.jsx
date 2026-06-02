import { useState, useEffect } from 'react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldClass(hasError) {
  return `w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'
  }`;
}

function DepartmentForm({ initialData, onSubmit, isEditMode }) {
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentDescription: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const validate = () => {
    const errs = {};
    const name = formData.departmentName.trim();
    if (!name) {
      errs.departmentName = '부서명을 입력해 주세요.';
    } else if (name.length < 2) {
      errs.departmentName = '부서명은 2자 이상이어야 합니다.';
    } else if (name.length > 50) {
      errs.departmentName = '부서명은 50자 이하여야 합니다.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 즉시 해제
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서명 <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="departmentName"
          value={formData.departmentName}
          onChange={handleChange}
          className={fieldClass(!!errors.departmentName)}
          placeholder="2자 이상 입력"
        />
        {errors.departmentName && (
          <p className="text-red-500 text-xs mt-1">{errors.departmentName}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서 설명</label>
        <textarea
          name="departmentDescription"
          value={formData.departmentDescription}
          onChange={handleChange}
          rows={3}
          className={fieldClass(false)}
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
