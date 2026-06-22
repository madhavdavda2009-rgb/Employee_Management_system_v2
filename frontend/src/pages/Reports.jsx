import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import api from '../utils/api';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select date range');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/reports/generate', {
        params: { startDate, endDate, department }
      });
      setReport(data);
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const response = await api.get('/reports/generate', {
        params: { startDate, endDate, department, format: 'csv' },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download CSV');
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Generate and download attendance reports</p>
      </motion.div>

      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field bg-white/10 text-white"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field bg-white/10 text-white"
          />
          <input
            type="text"
            placeholder="Department (Optional)"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field bg-white/10 text-white placeholder-white/60"
          />
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Report Summary</h2>
            <button onClick={downloadCSV} className="btn-primary flex items-center gap-2">
              <Download size={20} />
              Download CSV
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-500/20 p-4 rounded-lg">
              <p className="text-green-200 text-sm">Present</p>
              <p className="text-2xl font-bold text-white">{report.summary.present}</p>
            </div>
            <div className="bg-yellow-500/20 p-4 rounded-lg">
              <p className="text-yellow-200 text-sm">Late</p>
              <p className="text-2xl font-bold text-white">{report.summary.late}</p>
            </div>
            <div className="bg-red-500/20 p-4 rounded-lg">
              <p className="text-red-200 text-sm">Absent</p>
              <p className="text-2xl font-bold text-white">{report.summary.absent}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/90">Date</th>
                  <th className="text-left py-3 px-4 text-white/90">Employee</th>
                  <th className="text-left py-3 px-4 text-white/90">Department</th>
                  <th className="text-left py-3 px-4 text-white/90">Status</th>
                </tr>
              </thead>
              <tbody>
                {report.records.map((record) => (
                  <tr key={record._id} className="border-b border-white/10 hover:bg-white/8 transition-colors duration-200">
                    <td className="py-3 px-4 text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white">{record.employeeId.name}</td>
                    <td className="py-3 px-4 text-white">{record.employeeId.department}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'Present' ? 'bg-green-500/20 text-green-200' :
                        record.status === 'Late' ? 'bg-yellow-500/20 text-yellow-200' :
                        'bg-red-500/20 text-red-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
