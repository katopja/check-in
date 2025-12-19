
import React, { useState, useEffect } from 'react';
import { UserRole, AttendanceRecord } from './types';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentView from './components/StudentView';
import { UserCircle2, GraduationCap, School } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('attendance_records');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const handleCheckIn = (newRecord: AttendanceRecord) => {
    setAttendanceRecords(prev => [...prev, newRecord]);
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="mb-12 text-center">
          <div className="inline-block p-4 bg-white rounded-[2rem] shadow-xl mb-6">
            <School className="text-indigo-600" size={64} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">ClassCheck</h1>
          <p className="text-slate-500 mt-2 font-medium">ระบบเช็คชื่ออัจฉริยะผ่าน QR Code</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button 
            onClick={() => setRole('professor')}
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border-2 border-transparent hover:border-indigo-600 transition-all flex flex-col items-center text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <UserCircle2 size={120} />
            </div>
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-inner">
              <UserCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">สำหรับอาจารย์</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              จัดการวิชาเรียน, สร้าง QR Code และดูรายงานการเข้าเรียนพร้อมระบบวิเคราะห์ด้วย AI
            </p>
          </button>

          <button 
            onClick={() => setRole('student')}
            className="group relative bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border-2 border-transparent hover:border-emerald-600 transition-all flex flex-col items-center text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <GraduationCap size={120} />
            </div>
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">สำหรับนักศึกษา</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              สแกน QR Code เพื่อเช็คชื่อเข้าห้องเรียน และดูสถิติการมาเรียนของตัวเองได้ทันที
            </p>
          </button>
        </div>
        
        <p className="mt-12 text-slate-300 text-sm font-medium">© 2024 ClassCheck ระบบบริหารการศึกษา</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setRole(null)}>
            <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-200">
              <School className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">ClassCheck</span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
              role === 'professor' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {role === 'professor' ? 'อาจารย์' : 'นักศึกษา'}
            </span>
            <button 
              onClick={() => setRole(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-xl"
              title="ออกจากระบบ"
            >
              <LogOutIcon />
            </button>
          </div>
        </div>
      </nav>

      <main className="py-6">
        {role === 'professor' ? (
          <ProfessorDashboard records={attendanceRecords} />
        ) : (
          <StudentView onCheckIn={handleCheckIn} myRecords={attendanceRecords} />
        )}
      </main>
    </div>
  );
};

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

export default App;
