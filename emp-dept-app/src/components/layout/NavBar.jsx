import { Link } from 'react-router';

function NavBar() {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex gap-6 items-center">
      <Link to="/" className="font-bold text-lg mr-4">EmpManager</Link>
      <Link to="/departments" className="hover:text-indigo-200">Departments</Link>
      <Link to="/employees" className="hover:text-indigo-200">Employees</Link>
    </nav>
  );
}

export default NavBar;
