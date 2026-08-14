import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MessageSquare, User, Calendar } from 'lucide-react';
import React from 'react';
import { feedbackService, projectService } from '../services/api';

interface FeedbackItem {
  id: number;
  comment: string;
  instructorName: string;
  date: string;
  projectName: string;
}

interface Project {
  id: number;
  name: string;
  student?: string;
}

export function Feedback_student() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const studentName = currentUser?.name || 'สมชาย ใจดี';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allFeedback, allProjects] = await Promise.all([
          feedbackService.getFeedback(),
          projectService.getProjects(),
        ]);

        // Get names of projects belonging to this student
        const studentProjectNames = (allProjects || [])
          .filter((p: Project) => p.student === studentName || !p.student || p.student.includes(studentName.split(' ')[0]))
          .map((p: Project) => p.name);

        // Filter feedback comments matching student's project names
        const filteredFeedback = (allFeedback || []).filter(
          (f: FeedbackItem) => studentProjectNames.length === 0 || studentProjectNames.includes(f.projectName) || !f.projectName
        );

        setFeedbackData(filteredFeedback);
      } catch (err) {
        console.error('Error fetching student feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentName]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">ข้อเสนอแนะของฉัน</h1>
        <p className="text-gray-600 mt-1">ข้อเสนอแนะสำหรับนิสิต: {studentName}</p>
      </div>

      {loading ? (
        <p className="p-6 text-gray-500">กำลังโหลดข้อเสนอแนะ...</p>
      ) : feedbackData.length === 0 ? (
        <p className="text-gray-500 p-6">ยังไม่มีข้อเสนอแนะสำหรับโครงการของคุณ</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>รายการข้อเสนอแนะจากอาจารย์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.map((feedback) => (
                <Card key={feedback.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 leading-relaxed font-normal">
                            {feedback.comment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 pl-8">
                        {feedback.instructorName && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-green-700" />
                            <span className="font-medium text-gray-800">{feedback.instructorName}</span>
                          </div>
                        )}
                        {feedback.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(feedback.date).toLocaleDateString('th-TH')}</span>
                          </div>
                        )}
                      </div>
                      {feedback.projectName && (
                        <div className="pl-8">
                          <span className="text-xs bg-green-100 text-green-800 px-2.5 py-1 rounded-full font-medium">
                            โครงการ: {feedback.projectName}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}