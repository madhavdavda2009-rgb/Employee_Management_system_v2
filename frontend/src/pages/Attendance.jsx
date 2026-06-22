import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Webcam from 'react-webcam';
import api from '../utils/api';
import { loadModels, detectFace, getFaceDescriptor } from '../utils/faceDetection';

const Attendance = () => {
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [modelsReady, setModelsReady] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    fetchTodayAttendance();
    initModels();
  }, []);

  const initModels = async () => {
    const loaded = await loadModels();
    setModelsReady(loaded);
  };

  const fetchTodayAttendance = async () => {
    try {
      const { data } = await api.get('/attendance/today');
      setTodayAttendance(data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  };

  const markAttendance = async () => {
    if (!modelsReady) {
      setMessage('Face detection models not loaded. Please refresh.');
      return;
    }

    setScanning(true);
    setMessage('Detecting face...');
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const img = new Image();
      img.src = imageSrc;

      img.onload = async () => {
        const detection = await detectFace(img);
        
        if (!detection) {
          setMessage('No face detected. Please try again.');
          setScanning(false);
          return;
        }

        const descriptor = getFaceDescriptor(detection);
        
        try {
          const { data } = await api.post('/attendance/mark', { 
            faceDescriptor: descriptor 
          });
          
          setMessage(`✓ ${data.employee.name} - ${data.status}`);
          setShowScanner(false);
          fetchTodayAttendance();
        } catch (error) {
          setMessage(error.response?.data?.error || 'Recognition failed');
        } finally {
          setScanning(false);
        }
      };
    } catch (error) {
      setMessage('Error processing face');
      setScanning(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Attendance</h1>
          <p className="text-slate-400">Face recognition-based attendance marking</p>
        </div>
        <motion.button
          onClick={() => setShowScanner(!showScanner)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <Camera size={20} />
          {showScanner ? 'Close Scanner' : 'Mark Attendance'}
        </motion.button>
      </motion.div>

      {showScanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Face Recognition Scanner</h2>

          {!modelsReady && (
            <div className="bg-yellow-500/20 p-4 rounded-lg text-yellow-200 mb-4">
              Loading face detection models...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 flex items-center justify-center">
              <div className="relative scanner-frame w-72 h-72 rounded-full flex items-center justify-center">
                <div className={`absolute inset-4 rounded-full overflow-hidden bg-black/20 border border-white/5`}> 
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="scan-ring absolute w-80 h-80 rounded-full border-2 border-gradient-to-r from-indigo-500 to-purple-500 opacity-60 animate-pulse" />
                <div className="scan-overlay absolute w-80 h-80 rounded-full pointer-events-none">
                  <div className="scan-line absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent top-1/3 rounded-full" />
                </div>

                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg`}>
                    {scanning ? (
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-center">
                        ○
                      </motion.div>
                    ) : (
                      <span>●</span>
                    )}
                  </div>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute top-4 left-4 px-3 py-2 rounded-lg text-xs font-medium ${message.includes('✓') ? 'bg-emerald-600/80 text-emerald-50' : 'bg-red-600/80 text-red-50'}`}
                  >
                    {message.includes('✓') ? '✓ ' : '✗ '}
                    {message}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="md:col-span-1 space-y-4">
              <div className="glass-card p-4 rounded-xl">
                <p className="text-sm text-slate-400">Scanner Status</p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{scanning ? 'Scanning...' : modelsReady ? 'Ready to Scan' : 'Loading models'}</p>
                    <p className="text-xs text-slate-400 mt-1">Confidence indicator and live preview</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={markAttendance}
                    disabled={scanning || !modelsReady}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {scanning ? (
                      <span>Scanning...</span>
                    ) : (
                      <>
                        <Camera size={16} />
                        <span>Start Scan</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-400">Realtime Confidence</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-2 h-10 bg-slate-800 rounded-md" />
                    <div className="flex-1 bg-slate-900/40 rounded-full h-3 relative overflow-hidden">
                      <div className="absolute h-full bg-gradient-to-r from-emerald-500 to-indigo-500" style={{ width: scanning ? '60%' : '0%' }} />
                    </div>
                    <div className="text-sm font-medium text-white">{scanning ? '●' : '—'}</div>
                  </div>
                </div>

              </div>

              <div className="glass p-4 rounded-xl">
                <p className="text-sm text-slate-400">Quick Tips</p>
                <ul className="text-xs text-slate-300 mt-2 space-y-2">
                  <li>Position face in the center of the circle</li>
                  <li>Ensure good lighting and face visibility</li>
                  <li>Remove masks or occlusions for better accuracy</li>
                </ul>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      <div className="glass rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Today's Attendance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white/90">Employee</th>
                <th className="text-left py-3 px-4 text-white/90">Check In</th>
                <th className="text-left py-3 px-4 text-white/90">Status</th>
                <th className="text-left py-3 px-4 text-white/90">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {todayAttendance.map((record) => (
                <tr key={record._id} className="border-b border-white/10 hover:bg-white/8 transition-colors duration-200">
                  <td className="py-3 px-4 text-white">
                    {record.employeeId.name} ({record.employeeId.employeeId})
                  </td>
                  <td className="py-3 px-4 text-white">
                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === 'Present' ? 'bg-green-500/20 text-green-200' :
                      record.status === 'Late' ? 'bg-yellow-500/20 text-yellow-200' :
                      'bg-red-500/20 text-red-200'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">
                    {record.confidence ? `${record.confidence}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
