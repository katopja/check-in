
import React, { useState, useEffect, useRef } from 'react';
import { AttendanceRecord, Student } from '../types';
import { MOCK_STUDENTS, CURRENT_SESSION } from '../constants';
// Added Clock icon to the lucide-react imports to fix the missing component error
import { Camera, CheckCircle2, ScanLine, XCircle, LogOut, Loader2, Clock } from 'lucide-react';

interface Props {
  onCheckIn: (record: AttendanceRecord) => void;
  myRecords: AttendanceRecord[];
}

const StudentView: React.FC<Props> = ({ onCheckIn, myRecords }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (status === 'scanning') {
      // จำลองการเปิดกล้อง
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          .then(stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => console.error("Camera access error:", err));
      }

      // จำลองการสแกนติดหลังจาก 2 วินาที
      const timer = setTimeout(() => {
        handleFinalizeCheckIn();
      }, 2500);

      return () => {
        clearTimeout(timer);
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }
  }, [status]);

  const handleFinalizeCheckIn = () => {
    if (!selectedStudent) return;
    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Assume class starts at 09:00. After 09:15 is late.
    let attendStatus: 'present' | 'late' = 'present';
    if (hours > 9 || (hours === 9 && minutes > 15)) {
      attendStatus = 'late';
    }

    const newRecord: AttendanceRecord = {
      id: `rec_${Date.now()}`,
      studentId: selectedStudent.studentId,
      studentName: selectedStudent.name,
      timestamp: now.toISOString(),
      week: CURRENT_SESSION.week,
      status: attendStatus
    };

    onCheckIn(newRecord);
    setStatus('success');
    
    setTimeout(() => {
        if (status === 'success') setStatus('idle');
    }, 4000);
  };

  if (!selectedStudent) {
    return (
      <div className="max-w-md mx-auto p-6 flex flex-col items-center">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-2xl shadow-indigo-200">
          <ScanLine size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">ยินดีต้อนรับ</h1>
        <p className="text-slate-400 mb-8 text-center font-medium">กรุณาเลือกชื่อของท่านเพื่อเตรียมสแกน</p>
        
        <div className="w-full space-y-4">
          {MOCK_STUDENTS.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className="w-full bg-white p-5 rounded-3xl shadow-sm border border-slate-100 text-left hover:border-indigo-400 hover:bg-indigo-50 transition-all flex justify-between items-center group active:scale-95"
            >
              <div>
                <div className="font-bold text-slate-700 text-lg">{student.name}</div>
                <div className="text-sm text-slate-400 font-semibold">{student.studentId}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const hasCheckedInToday = myRecords.some(r => r.studentId === selectedStudent.studentId && r.week === CURRENT_SESSION.week);

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 pb-24">
      {/* Header Profile */}
      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-50 mb-6">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-start">
          <div>
            <div className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-1">Student Profile</div>
            <h2 className="font-black text-2xl">{selectedStudent.name}</h2>
            <p className="text-indigo-100 text-sm opacity-80 font-medium">ID: {selectedStudent.studentId}</p>
          </div>
          <button onClick={() => setSelectedStudent(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-10">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">วิชาที่กำลังเปิดสอน</h3>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] px-2 py-1 rounded-full font-bold">LIVE NOW</span>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="font-black text-slate-800 text-xl leading-tight">{CURRENT_SESSION.courseName}</div>
              <div className="flex justify-between mt-4 text-sm font-bold">
                <span className="text-slate-400">สัปดาห์ที่ {CURRENT_SESSION.week}</span>
                <span className="text-indigo-600">{CURRENT_SESSION.date}</span>
              </div>
            </div>
          </div>

          {!hasCheckedInToday ? (
            <div className="space-y-6">
              {status === 'scanning' ? (
                <div className="relative aspect-square w-full bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                      <div className="w-full h-1 bg-indigo-500/50 absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="mt-8 text-white font-bold animate-pulse text-sm tracking-widest uppercase">เล็งไปที่ QR Code ของอาจารย์</p>
                  </div>
                </div>
              ) : status === 'success' ? (
                <div className="flex flex-col items-center py-10 animate-in zoom-in-50 duration-500">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-50">
                    <CheckCircle2 size={56} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">เช็คชื่อสำเร็จ!</h3>
                  <p className="text-slate-400 font-medium">ตั้งใจเรียนนะ {selectedStudent.name.split(' ')[0]}!</p>
                </div>
              ) : (
                <button
                  onClick={() => setStatus('scanning')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 transition-all flex flex-col items-center gap-3 active:scale-95"
                >
                  <Camera size={32} />
                  สแกนจากหน้าจออาจารย์
                </button>
              )}
              
              {status === 'scanning' && (
                <button 
                    onClick={() => setStatus('idle')}
                    className="w-full text-slate-400 font-bold text-sm"
                >
                    ยกเลิกการสแกน
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
               <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-black text-emerald-800">เช็คชื่อเรียบร้อยแล้ว</h3>
                  <p className="text-emerald-600 font-medium text-sm mt-1 opacity-80">คุณได้ทำการเช็คชื่อในสัปดาห์ที่ {CURRENT_SESSION.week} แล้ว</p>
               </div>
               
               <div className="mt-10 text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">ข้อมูลการสแกนวันนี้</h4>
                  {myRecords.filter(r => r.studentId === selectedStudent.studentId && r.week === CURRENT_SESSION.week).map(r => (
                    <div key={r.id} className="flex justify-between items-center p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${r.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           <Clock size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold uppercase">Time Logged</div>
                          <div className="text-slate-800 font-black text-lg">{new Date(r.timestamp).toLocaleTimeString('th-TH')}</div>
                        </div>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {r.status === 'present' ? 'ON TIME' : 'LATE'}
                      </span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StudentView;
