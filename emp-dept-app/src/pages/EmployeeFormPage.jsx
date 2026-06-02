import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useEmployeeStore from '../store/employeeStore';
import EmployeeForm from '../components/employee/EmployeeForm';

function EmployeeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEmployees, addEmployee, updateEmployee } = useEmployeeStore();
  const [initialData, setInitialData] = useState(null);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      // fetch 완료 후 getState()로 최신 스토어 값을 직접 읽어 클로저 문제를 방지
      fetchEmployees().then(() => {
        const { employees } = useEmployeeStore.getState();
        const emp = employees.find((e) => e.id === Number(id));
        if (emp) setInitialData(emp);
      });
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateEmployee(Number(id), formData);
        toast.success('직원 정보가 수정되었습니다.');
      } else {
        await addEmployee(formData);
        toast.success('직원이 등록되었습니다.');
      }
      navigate('/employees');
    } catch {
      toast.error(isEditMode ? '직원 수정에 실패했습니다.' : '직원 등록에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? '직원 수정' : '직원 등록'}
      </h1>
      <EmployeeForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
      />
    </div>
  );
}

export default EmployeeFormPage;
