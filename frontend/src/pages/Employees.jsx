import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import EmployeeForm from '../components/EmployeeForm';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (error) {
      alert('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Employees</h1>
          <p className="text-slate-400">Manage employee directory and information</p>
        </div>
        <motion.button
          onClick={() => { setShowForm(true); setSelectedEmployee(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Employee
        </motion.button>
      </motion.div>

      <div className="glass rounded-xl p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/60" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 bg-white/10 text-white placeholder-white/60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white/90">ID</th>
                <th className="text-left py-3 px-4 text-white/90">Name</th>
                <th className="text-left py-3 px-4 text-white/90">Email</th>
                <th className="text-left py-3 px-4 text-white/90">Department</th>
                <th className="text-left py-3 px-4 text-white/90">Designation</th>
                <th className="text-right py-3 px-4 text-white/90">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <motion.tr
                  key={emp._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-white/10 hover:bg-white/8 transition-colors duration-200"
                >
                  <td className="py-3 px-4 text-white">{emp.employeeId}</td>
                  <td className="py-3 px-4 text-white">{emp.name}</td>
                  <td className="py-3 px-4 text-white">{emp.email}</td>
                  <td className="py-3 px-4 text-white">{emp.department}</td>
                  <td className="py-3 px-4 text-white">{emp.designation}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { setSelectedEmployee(emp); setShowForm(true); }}
                      className="text-blue-400 hover:text-blue-300 hover:scale-110 mx-2 transition-all duration-200"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <EmployeeForm
          employee={selectedEmployee}
          onClose={() => { setShowForm(false); setSelectedEmployee(null); }}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
};

export default Employees;
