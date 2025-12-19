
import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AttendanceRecord } from '../types';
import { CURRENT_SESSION, MOCK_STUDENTS } from '../constants';
import { analyzeAttendance } from '../services/geminiService';
import { QrCode, ClipboardList, BrainCircuit, UserCheck, Clock, UserX, Maximize2, Minimize2, Users } from 'lucide-react';

interface Props {
  records: AttendanceRecord[];
}

const ProfessorDashboard: React.FC<Props> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'reports' | 'ai'>('qr');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qrToken, setQrToken] = useState(Math.random().toString(36).substring(7));

  // จำลองการเปลี่ยน Token ทุก 30 วินาทีเพื่อความปลอดภัย
  useEffect(() => {
    const interval = setInterval(() => {
      setQrToken(Math.random().toString(36).substring(7));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const qrValue = JSON.stringify({
    sessionId: CURRENT_SESSION.id,
    week: CURRENT_SESSION.week,
    token: qrToken,
    expires: Date.now() + 30000
  });

  const getStats = () => {
    const total = MOCK_STUDENTS.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = total - present - late;
    return { present, late, absent, total };
  };

  const stats = getStats();
  const recentCheckIns = [...records].reverse().slice(0, 5);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeAttendance(records);
    setAiAnalysis(result || "Error analysis");
    setIsAnalyzing(false);
  };

  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-indigo-900 z-[100] flex flex-col items-center justify-center p-8 text-white">
        <button 
          onClick={() => setIsFullScreen(false)}
          className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"
        >
          <Minimize2 size={32} />
        </button>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4">สแกนเพื่อเช็คชื่อเข้าเรียน</h1>
          <p className="text-2xl text-indigo-200">{CURRENT_SESSION.courseName} (สัปดาห์ที่ {CURRENT_SESSION.week})</p>
        </div>
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl mb-12 transform hover:scale-105 transition-transform duration-500">
          <QRCodeCanvas value={qrValue} size={450} level="H" includeMargin={true} />
        </div>
        <div className="flex gap-12 items-center bg-white/10 px-12 py-6 rounded-3xl backdrop-blur-md">
           <div className="text-center">
             <div className="text-4xl font-bold">{stats.present + stats.late}</div>
             <div className="text-indigo-200">มาแล้ว</div>
           </div>
           <div className="w-px h-12 bg-white/20"></div>
           <div className="text-center">
             <div className="text-4xl font-bold">{stats.total}</div>
             <div className="text-indigo-200">ทั้งหมด</div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">แดชบอร์ดอาจารย์</h1>
          <p className="text-slate-500">{CURRENT_SESSION.courseName} - สัปดาห์ที่ {CURRENT_SESSION.week}</p>
        </div>
        <div className="flex bg-white rounded-xl shadow-sm p-1 border border-slate-200">
          <button onClick={() => setActiveTab('qr')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'qr' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
            <QrCode size={18} /> QR Code
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
            <ClipboardList size={18} /> รายงาน
          </button>
          <button onClick={() => setActiveTab('ai')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BrainCircuit size={18} /> วิเคราะห์ AI
          </button>
        </div>
      </div>

      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center justify-center border border-slate-100 relative group">
            <h2 className="text-xl font-bold mb-6 text-slate-700">Scan เพื่อเช็คชื่อ</h2>
            <div className="p-6 bg-white rounded-2xl shadow-inner border border-slate-100 relative">
              <QRCodeCanvas value={qrValue} size={250} level="H" />
              <button 
                onClick={() => setIsFullScreen(true)}
                className="absolute inset-0 flex items-center justify-center bg-indigo-600/0 group-hover:bg-indigo-600/80 transition-all rounded-2xl opacity-0 group-hover:opacity-100 text-white font-bold gap-2"
              >
                <Maximize2 size={24} /> ขยายเต็มหน้าจอ
              </button>
            </div>
            <p className="mt-6 text-slate-400 text-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              QR Code เปลี่ยนอัตโนมัติเพื่อความปลอดภัย
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
              <h3 className="text-lg font-bold mb-4 text-slate-700 flex items-center gap-2">
                <Users size={20} className="text-indigo-600" /> นักศึกษาที่เพิ่งเช็คชื่อ
              </h3>
              <div className="space-y-3">
                {recentCheckIns.length > 0 ? recentCheckIns.map(record => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl animate-in slide-in-from-right duration-500">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                        {record.studentName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700">{record.studentName}</div>
                        <div className="text-xs text-slate-400">{record.studentId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-indigo-600">{new Date(record.timestamp).toLocaleTimeString('th-TH')}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {record.status === 'present' ? 'มาเรียน' : 'สาย'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center text-slate-400 italic">กำลังรอการสแกนจากนักศึกษา...</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <div className="text-2xl font-bold text-emerald-700">{stats.present}</div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">มาเรียน</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <div className="text-2xl font-bold text-amber-700">{stats.late}</div>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">มาสาย</div>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                <div className="text-xs font-bold text-red-600 uppercase tracking-wider">ขาดเรียน</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">รหัสนักศึกษา</th>
                <th className="px-6 py-4 font-semibold text-slate-700">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4 font-semibold text-slate-700">เวลาที่เช็ค</th>
                <th className="px-6 py-4 font-semibold text-slate-700">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.length > 0 ? records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-600">{record.studentId}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">{record.studentName}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(record.timestamp).toLocaleTimeString('th-TH')} น.</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 
                      record.status === 'late' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.status === 'present' ? 'มาเรียน' : record.status === 'late' ? 'สาย' : 'ขาด'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">ยังไม่มีข้อมูลการเช็คชื่อ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white">
              <BrainCircuit size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">การวิเคราะห์ด้วย AI อัจฉริยะ</h2>
              <p className="text-slate-500 text-sm">ใช้ Gemini วิเคราะห์แนวโน้มและพฤติกรรมการเข้าเรียน</p>
            </div>
          </div>
          
          {!aiAnalysis ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 mb-6">กดปุ่มด้านล่างเพื่อเริ่มการวิเคราะห์ข้อมูลการเข้าเรียนของสัปดาห์นี้</p>
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all transform hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    กำลังวิเคราะห์...
                  </>
                ) : (
                  <>เริ่มการวิเคราะห์ข้อมูล</>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="prose prose-slate max-w-none bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 text-slate-700 whitespace-pre-wrap leading-relaxed">
                {aiAnalysis}
              </div>
              <button onClick={() => setAiAnalysis(null)} className="text-indigo-600 font-semibold hover:underline">
                วิเคราะห์ใหม่อีกครั้ง
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;
