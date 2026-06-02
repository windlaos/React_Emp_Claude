import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
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
    if (isEditMode) {
      await updateDepartment(Number(id), formData);
    } else {
      await addDepartment(formData);
    }
    navigate('/departments');
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
