
import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord } from "../types";

export const analyzeAttendance = async (records: AttendanceRecord[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    นี่คือข้อมูลการเช็คชื่อเข้าเรียนของนักศึกษาในวิชา CPE301:
    ${JSON.stringify(records)}
    
    ช่วยวิเคราะห์ข้อมูลนี้และสรุปผลในรูปแบบที่น่าสนใจสำหรับอาจารย์:
    1. สรุปภาพรวมจำนวนคนเข้าเรียน (มาสายกี่คน มาตรงเวลากี่คน)
    2. รายชื่อนักศึกษาที่ควรติดตามเป็นพิเศษ (เช่น มาสายบ่อย)
    3. ข้อเสนอแนะในการปรับปรุงการเรียนการสอนเพื่อให้เด็กเข้าเรียนมากขึ้น
    
    ตอบเป็นภาษาไทย โดยจัดรูปแบบให้ดูง่าย (Markdown)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }
};
