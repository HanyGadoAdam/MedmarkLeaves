
import { GoogleGenAI } from "@google/genai";
import { LeaveRequest, User } from "../types";

// Fix: Initializing GoogleGenAI with the required named parameter and strictly using process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLeaveInsights = async (requests: LeaveRequest[], employees: User[], lang: 'en' | 'ar') => {
  const dataSummary = requests.map(r => ({
    employee: r.userName,
    // Fix: Using typeId as defined in the LeaveRequest type instead of non-existent type property.
    type: r.typeId,
    days: r.totalDays,
    status: r.status,
    date: r.startDate
  }));

  const prompt = lang === 'en' 
    ? `Analyze the following leave data and provide a short, professional summary (3-4 sentences) highlighting trends, potential resource shortages, or frequent leave takers. Data: ${JSON.stringify(dataSummary)}`
    : `قم بتحليل بيانات الإجازات التالية وقدم ملخصاً مهنياً قصيراً (3-4 جمل) يوضح الاتجاهات، النقص المحتمل في الموارد، أو الموظفين الذين يأخذون إجازات متكررة. البيانات: ${JSON.stringify(dataSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fix: Accessing text as a property rather than a method call.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'en' ? "Unable to generate insights at this time." : "تعذر إنشاء الرؤى في الوقت الحالي.";
  }
};
