import { useState, useEffect } from 'react';
import useDepartmentStore from '../../store/departmentStore';
import { getEmployeeByEmail } from '../../api/employeeApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fieldClass(hasError) {
  return `w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'
  }`;
}

function EmployeeForm({ initialData, onSubmit, isEditMode, currentEmployeeId }) {
  const { departments, fetchDepartments } = useDepartmentStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    departmentId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = async () => {
    const errs = {};

    if (!formData.firstName.trim()) {
      errs.firstName = '이름을 입력해 주세요.';
    }
    if (!formData.lastName.trim()) {
      errs.lastName = '성을 입력해 주세요.';
    }

    const email = formData.email.trim();
    if (!email) {
      errs.email = '이메일을 입력해 주세요.';
    } else if (!EMAIL_REGEX.test(email)) {
      errs.email = '올바른 이메일 형식이 아닙니다. (예: user@company.com)';
    } else {
      // 이메일 중복 체크 — /api/employees/email/:email 활용
      try {
        const res = await getEmployeeByEmail(email);
        // 200: 이미 존재하는 이메일 — 수정 모드에서 본인 이메일은 허용
        if (res.data.id !== currentEmployeeId) {
          errs.email = '이미 사용 중인 이메일입니다.';
        }
      } catch (err) {
        // 404: 사용 가능한 이메일 (중복 없음)
        if (err.response?.status !== 404) {
          // 예상치 못한 오류는 무시하고 통과
        }
      }
    }

    if (!formData.departmentId) {
      errs.departmentId = '부서를 선택해 주세요.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errs = await validate();
    setIsSubmitting(false);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // <select> value는 문자열이므로 Number로 변환 후 전송
    onSubmit({ ...formData, departmentId: Number(formData.departmentId) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={fieldClass(!!errors.firstName)}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성 <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={fieldClass(!!errors.lastName)}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">이메일 <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={fieldClass(!!errors.email)}
          placeholder="user@company.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">부서 <span className="text-red-500">*</span></label>
        <select
          name="departmentId"
          value={formData.departmentId}
          onChange={handleChange}
          className={fieldClass(!!errors.departmentId)}
        >
          <option value="">-- 부서 선택 --</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.departmentName}</option>
          ))}
        </select>
        {errors.departmentId && (
          <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="self-end px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '확인 중...' : isEditMode ? '수정 완료' : '등록'}
      </button>
    </form>
  );
}

export default EmployeeForm;
