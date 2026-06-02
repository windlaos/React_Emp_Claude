import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import useDepartmentStore from '../store/departmentStore';
import { getDepartmentById } from '../api/departmentApi';
import DepartmentForm from '../components/department/DepartmentForm';

function DepartmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addDepartment, updateDepartment } = useDepartmentStore();
  const [initialData, setInitialData] = useState(null);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      getDepartmentById(id).then((res) => setInitialData(res.data));
    }
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateDepartment(Number(id), formData);
        toast.success('부서가 수정되었습니다.');
      } else {
        await addDepartment(formData);
        toast.success('부서가 등록되었습니다.');
      }
      navigate('/departments');
    } catch {
      toast.error(isEditMode ? '부서 수정에 실패했습니다.' : '부서 등록에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? '부서 수정' : '부서 등록'}
      </h1>
      <DepartmentForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
      />
    </div>
  );
}

export default DepartmentFormPage;
