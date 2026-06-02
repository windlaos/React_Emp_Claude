import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import DepartmentListPage from './pages/DepartmentListPage';
import DepartmentFormPage from './pages/DepartmentFormPage';
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeFormPage from './pages/EmployeeFormPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,                    element: <HomePage /> },
      { path: 'departments',            element: <DepartmentListPage /> },
      { path: 'departments/new',        element: <DepartmentFormPage /> },
      { path: 'departments/:id/edit',   element: <DepartmentFormPage /> },
      { path: 'employees',              element: <EmployeeListPage /> },
      { path: 'employees/new',          element: <EmployeeFormPage /> },
      { path: 'employees/:id/edit',     element: <EmployeeFormPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
