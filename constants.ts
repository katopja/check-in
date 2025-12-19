
import { Student, ClassSession } from './types';

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'สมชาย รักเรียน', studentId: '6401001' },
  { id: '2', name: 'สมหญิง ขยันหมั่นเพียร', studentId: '6401002' },
  { id: '3', name: 'วิชัย ตั้งใจฟัง', studentId: '6401003' },
  { id: '4', name: 'นารี มีความรู้', studentId: '6401004' },
  { id: '5', name: 'ปกรณ์ อดทนมาก', studentId: '6401005' },
];

export const CURRENT_SESSION: ClassSession = {
  id: 'session_w5_2024',
  courseName: 'การพัฒนาเว็บแอปพลิเคชัน (CPE301)',
  week: 5,
  date: new Date().toLocaleDateString('th-TH'),
  startTime: '09:00',
};
