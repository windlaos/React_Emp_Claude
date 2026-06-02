import { create } from 'zustand';
import {
  getEmployeesWithDept,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../api/employeeApi';

const useEmployeeStore = create((set) => ({
  employees: [],
  isLoading: false,
  error: null,

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getEmployeesWithDept();
      set({ employees: res.data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEmployee: async (data) => {
    const res = await createEmployee(data);
    set((state) => ({ employees: [...state.employees, res.data] }));
  },

  updateEmployee: async (id, data) => {
    const res = await updateEmployee(id, data);
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? res.data : e)),
    }));
  },

  deleteEmployee: async (id) => {
    await deleteEmployee(id);
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    }));
  },
}));

export default useEmployeeStore;
