import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Shield, Users, KeyRound, Trash2 } from 'lucide-react';
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

  const handleToggleActive = async (employee) => {
    const action = employee.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${employee.name}?`)) return;

    try {
      await api.put(`/employees/${employee._id}`, { isActive: !employee.isActive });
      fetchEmployees();
    } catch (error) {
      alert(`Failed to ${action} employee`);
    }
  };

  const handleResetPassword = async (employee) => {
    if (!confirm(`Reset password for ${employee.name}?`)) return;

    try {
      const { data } = await api.post(`/employees/${employee._id}/reset-password`);
      alert(`New password for ${employee.name}: ${data.password}`);
    } catch (error) {
      alert('Failed to reset employee password');
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (!confirm(`Delete ${employee.name}? This will deactivate the account.`)) return;

    try {
      await api.delete(`/employees/${employee._id}`);
      fetchEmployees();
    } catch (error) {
      alert('Failed to delete employee');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    (emp.isActive ? 'active' : 'inactive').includes(search.toLowerCase())
  );

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-slate-400 max-w-2xl">
            Manage internal employee profiles, access state, and attendance-ready records.
          </p>
        </div>
        <motion.button
          onClick={() => { setShowForm(true); setSelectedEmployee(null); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          Create Employee Account
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-300">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Internal only</p>
            <p className="text-xs text-slate-400 mt-1">No public signup flow is exposed.</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-300">
            <Users size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin managed</p>
            <p className="text-xs text-slate-400 mt-1">Add, edit, activate, and deactivate employee profiles.</p>
          </div>
        </div>
        <div className="glass rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600/20 flex items-center justify-center text-amber-300">
            <Edit size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Attendance ready</p>
            <p className="text-xs text-slate-400 mt-1">Employee records stay aligned with face attendance.</p>
          </div>
        </div>
      </div>

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

        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white/90">ID</th>
                <th className="text-left py-3 px-4 text-white/90">Name</th>
                <th className="text-left py-3 px-4 text-white/90">Email</th>
                <th className="text-left py-3 px-4 text-white/90">Department</th>
                <th className="text-left py-3 px-4 text-white/90">Designation</th>
                <th className="text-left py-3 px-4 text-white/90">Status</th>
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
                  <td className="py-3 px-4 text-white" data-label="ID">{emp.employeeId}</td>
                  <td className="py-3 px-4 text-white" data-label="Name">{emp.name}</td>
                  <td className="py-3 px-4 text-white" data-label="Email">{emp.email}</td>
                  <td className="py-3 px-4 text-white" data-label="Department">{emp.department}</td>
                  <td className="py-3 px-4 text-white" data-label="Designation">{emp.designation}</td>
                  <td className="py-3 px-4" data-label="Status">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${emp.isActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" data-label="Actions">
                    <div className="table-actions" role="group" aria-label={`Actions for ${emp.name}`}>
                      <button
                        onClick={() => { setSelectedEmployee(emp); setShowForm(true); }}
                        className="text-blue-400 hover:text-blue-300 transition-all duration-200"
                        title={`Edit ${emp.name}`}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(emp)}
                        className={
                          `ml-3 ${emp.isActive ? 'text-amber-300 hover:text-amber-200' : 'text-green-400 hover:text-green-300'} transition-all duration-200`
                        }
                        title={`${emp.isActive ? 'Deactivate' : 'Activate'} ${emp.name}`}
                      >
                        {emp.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(emp)}
                        className="ml-3 text-violet-300 hover:text-violet-200 transition-all duration-200 inline-flex items-center gap-1"
                        title={`Reset password for ${emp.name}`}
                      >
                        <KeyRound size={16} />
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="ml-3 text-rose-300 hover:text-rose-200 transition-all duration-200 inline-flex items-center gap-1"
                        title={`Delete ${emp.name}`}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
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
