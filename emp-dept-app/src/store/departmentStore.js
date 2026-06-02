import { create } from 'zustand';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../api/departmentApi';

const useDepartmentStore = create((set) => ({
  departments: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await getDepartments();
      set({ departments: res.data });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addDepartment: async (data) => {
    const res = await createDepartment(data);
    set((state) => ({ departments: [...state.departments, res.data] }));
  },

  updateDepartment: async (id, data) => {
    const res = await updateDepartment(id, data);
    set((state) => ({
      departments: state.departments.map((d) => (d.id === id ? res.data : d)),
    }));
  },

  deleteDepartment: async (id) => {
    await deleteDepartment(id);
    set((state) => ({
      departments: state.departments.filter((d) => d.id !== id),
    }));
  },
}));

export default useDepartmentStore;
