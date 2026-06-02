import axiosInstance from './axiosInstance';

export const getDepartments    = ()           => axiosInstance.get('/departments');
export const getDepartmentById = (id)         => axiosInstance.get(`/departments/${id}`);
export const createDepartment  = (data)       => axiosInstance.post('/departments', data);
export const updateDepartment  = (id, data)   => axiosInstance.patch(`/departments/${id}`, data);
export const deleteDepartment  = (id)         => axiosInstance.delete(`/departments/${id}`);
