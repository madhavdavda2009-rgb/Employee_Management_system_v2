/**
 * QUICK START: Using Toast Notifications
 * 
 * Add this to any component to show toast notifications
 */

// ✅ Example 1: In a simple component
import { useToastContext } from '../context/ToastContext';

export function MyComponent() {
  const { success, error, warning, info } = useToastContext();

  const handleSave = async () => {
    try {
      // Do something
      success('Saved successfully!');
    } catch (err) {
      error('Failed to save: ' + err.message);
    }
  };

  return <button onClick={handleSave}>Save</button>;
}

// ✅ Example 2: Error handling in API calls
import api from '../utils/api';

export async function fetchEmployees() {
  try {
    const { data } = await api.get('/employees');
    return data;
  } catch (err) {
    // Use toast here
    const message = err.response?.data?.error || 'Failed to fetch employees';
    throw err;
  }
}

// ✅ Example 3: In Employees.jsx
import { useToastContext } from '../context/ToastContext';

const Employees = () => {
  const { success, error } = useToastContext();

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/employees/${id}`);
      success('Employee deleted successfully!');
      fetchEmployees();
    } catch (err) {
      error(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  // ... rest of component
};

// ✅ Example 4: In EmployeeForm.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!faceDescriptor && !employee) {
    error('Please capture your face before submitting');
    return;
  }

  try {
    // Save logic
    success(`Employee ${formData.name} saved successfully!`);
    onSuccess();
    onClose();
  } catch (err) {
    error(err.response?.data?.error || 'Failed to save employee');
  }
};

/**
 * TOAST TYPES & DEFAULTS
 * success(message, duration=4000)
 * error(message, duration=5000)
 * warning(message, duration=4500)
 * info(message, duration=4000)
 */
