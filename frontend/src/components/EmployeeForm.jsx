import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import api from '../utils/api';
import { loadModels, detectFace, getFaceDescriptor } from '../utils/faceDetection';

const EmployeeForm = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    employeeId: employee?.employeeId || '',
    name: employee?.name || '',
    email: employee?.email || '',
    password: employee?.password || '',
    phone: employee?.phone || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    joiningDate: employee?.joiningDate?.split('T')[0] || '',
    salary: employee?.salary || ''
  });
  const [showWebcam, setShowWebcam] = useState(!employee);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [savedCredentials, setSavedCredentials] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (showWebcam) {
      loadModels();
    }
  }, [showWebcam]);

  const captureFace = async () => {
    if (!webcamRef.current) return;

    setCapturing(true);
    setMessage('Detecting face...');

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const img = new Image();
      img.src = imageSrc;

      img.onload = async () => {
        const detection = await detectFace(img);

        if (!detection) {
          setMessage('No face detected. Please try again.');
          setCapturing(false);
          return;
        }

        const descriptor = getFaceDescriptor(detection);
        setFaceDescriptor(descriptor);
        setMessage('Face captured successfully!');
        setShowWebcam(false);
        setCapturing(false);
      };
    } catch (error) {
      setMessage('Error capturing face. Please try again.');
      setCapturing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employee && !faceDescriptor) {
      setMessage('Please capture face before submitting');
      return;
    }

    setLoading(true);
    try {
      const payload = employee
        ? formData
        : { ...formData, faceDescriptor };

      const url = employee ? `/employees/${employee._id}` : '/employees';
      const method = employee ? 'put' : 'post';

      const { data } = await api[method](url, payload);
      if (!employee) {
        setSavedCredentials(data.employee);
        setMessage(`Employee created successfully. Share these credentials with the employee.`);
        onSuccess();
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.250 }}
        className="glass rounded-2xl p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {employee ? 'Edit Employee Profile' : 'Create Employee Account'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {employee
                ? 'Update internal profile details and access state.'
                : 'Complete the profile and capture face data for attendance.'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <X size={24} />
          </motion.button>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-lg ${
              message.includes('success')
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
            }`}
          >
            {message}
          </motion.div>
        )}

          {savedCredentials && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-lg bg-slate-800/60 border border-indigo-500/30 text-slate-200 space-y-2"
            >
              <div className="text-sm font-semibold text-white">Generated Credentials</div>
              <div className="text-sm">Employee ID: <span className="text-white">{savedCredentials.employeeId}</span></div>
              <div className="text-sm">Email: <span className="text-white">{savedCredentials.email}</span></div>
              <div className="text-sm">Password: <span className="text-white">{savedCredentials.password}</span></div>
              <div className="text-sm">Status: <span className="text-white">{savedCredentials.isActive ? 'Active' : 'Inactive'}</span></div>
            </motion.div>
          )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
              disabled={employee}
            />
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
            />
            <input
              type="password"
              placeholder={employee ? 'Password (leave blank to keep current)' : 'Password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required={!employee}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
            />
            <input
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
            />
            <input
              type="text"
              placeholder="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
            />
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="input-field bg-white/10 text-white"
              required
            />
            <input
              type="number"
              placeholder="Salary"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="input-field bg-white/10 text-white placeholder-white/60"
              required
            />
          </div>

          {!employee && showWebcam && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50"
            >
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Camera size={18} className="text-indigo-400" />
                Face Registration
              </h3>
              <div className="relative rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full aspect-video object-cover"
                />
                <motion.button
                  type="button"
                  onClick={captureFace}
                  disabled={capturing}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-full disabled:opacity-60 shadow-lg transition-all duration-200"
                >
                  <Camera size={24} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {!employee && faceDescriptor && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-lg text-emerald-200 flex items-center gap-2"
            >
              <span className="text-lg">✓</span>
              <span>Face registered successfully! You can now submit the form.</span>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <motion.button
              type="submit"
              disabled={loading || (!employee && savedCredentials)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex-1 disabled:scale-100 w-full"
            >
              {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary px-6 w-full sm:w-auto"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EmployeeForm;
