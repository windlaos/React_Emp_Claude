import axiosInstance from './axiosInstance';

export const getEmployeesWithDept = ()           => axiosInstance.get('/employees/departments');
export const getEmployeeByEmail   = (email)      => axiosInstance.get(`/employees/email/${email}`);
export const createEmployee       = (data)       => axiosInstance.post('/employees', data);
export const updateEmployee       = (id, data)   => axiosInstance.put(`/employees/${id}`, data);
export const deleteEmployee       = (id)         => axiosInstance.delete(`/employees/${id}`);
