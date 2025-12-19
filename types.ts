
export interface Student {
  id: string;
  name: string;
  studentId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  week: number;
  status: 'present' | 'late' | 'absent';
}

export interface ClassSession {
  id: string;
  courseName: string;
  week: number;
  date: string;
  startTime: string;
}

export type UserRole = 'professor' | 'student';
