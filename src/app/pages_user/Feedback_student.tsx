import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { MessageSquare, User, Calendar, Send, CheckCheck } from 'lucide-react';
import React from 'react';
import { feedbackService, projectService } from '../services/api';

interface FeedbackItem {
  id: number;
  comment: string;
  instructorName: string;
  date: string;
  projectName: string;
  isRead?: boolean;
  replyComment?: string;
}

interface Project {
  id: number;
  name: string;
  student?: string;
}

export function Feedback_student() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const studentName = currentUser?.name || 'สมชาย ใจดี';

  const loadData = async () => {
    try {
      const [allFeedback, allProjects] = await Promise.all([
        feedbackService.getFeedback(),
        projectService.getProjects(),
      ]);

      const studentProjectNames = (allProjects || [])
        .filter((p: Project) => p.student === studentName || !p.student || p.student.includes(studentName.split(' ')[0]))
        .map((p: Project) => p.name);

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

  useEffect(() => {
    loadData();
  }, [studentName]);

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) return;
    await feedbackService.replyFeedback(id, replyText);
    setReplyText('');
    setReplyingId(null);
    await loadData();
  };

  const handleMarkAsRead = async (id: number) => {
    await feedbackService.markAsRead(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900 font-bold">ข้อเสนอแนะของฉัน</h1>
        <p className="text-gray-600 mt-1">ข้อเสนอแนะและคำแนะนำจากอาจารย์สำหรับนิสิต: {studentName}</p>
      </div>

      {loading ? (
        <p className="p-6 text-gray-500">กำลังโหลดข้อเสนอแนะ...</p>
      ) : feedbackData.length === 0 ? (
        <p className="text-gray-500 p-6">ยังไม่มีข้อเสนอแนะสำหรับโครงการของคุณ</p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>รายการข้อเสนอแนะจากอาจารย์ ({feedbackData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackData.map((feedback) => (
                <Card key={feedback.id} className={`border-l-4 ${feedback.isRead ? 'border-l-green-500 bg-white' : 'border-l-yellow-500 bg-yellow-50/20'}`}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <MessageSquare className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-900 leading-relaxed font-normal">
                              {feedback.comment}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${feedback.isRead ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {feedback.isRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}
                          </span>
                          {!feedback.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAsRead(feedback.id)}
                              className="text-xs h-7 px-2"
                            >
                              <CheckCheck className="w-3.5 h-3.5 mr-1 text-green-600" />
                              ทำเครื่องหมายว่าอ่านแล้ว
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-600 pl-8">
                        {feedback.instructorName && (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-green-700" />
                            <span className="font-medium text-gray-800">{feedback.instructorName}</span>
                          </div>
                        )}
                        {feedback.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(feedback.date).toLocaleDateString('th-TH')}</span>
                          </div>
                        )}
                      </div>

                      {feedback.projectName && (
                        <div className="pl-8">
                          <span className="text-xs bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-medium">
                            โครงการ: {feedback.projectName}
                          </span>
                        </div>
                      )}

                      {/* Display Reply if exists */}
                      {feedback.replyComment && (
                        <div className="ml-8 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">การตอบกลับของคุณ (นิสิต):</p>
                          <p className="text-xs text-gray-800">{feedback.replyComment}</p>
                        </div>
                      )}

                      {/* Reply Box */}
                      {replyingId === feedback.id ? (
                        <div className="pl-8 pt-2 space-y-2">
                          <Textarea
                            placeholder="พิมพ์ข้อความตอบกลับหรือสอบถามอาจารย์เพิ่มเติม..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            className="text-xs resize-none"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => setReplyingId(null)} className="text-xs h-7">
                              ยกเลิก
                            </Button>
                            <Button size="sm" onClick={() => handleSendReply(feedback.id)} className="bg-green-600 hover:bg-green-700 text-xs h-7">
                              <Send className="w-3 h-3 mr-1" />
                              ส่งคำตอบกลับ
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="pl-8 pt-1">
                          <button
                            onClick={() => {
                              setReplyingId(feedback.id);
                              setReplyText(feedback.replyComment || '');
                            }}
                            className="text-xs text-green-700 hover:text-green-800 font-medium hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {feedback.replyComment ? 'แก้ไขคำตอบกลับ' : 'ตอบกลับข้อเสนอแนะนี้'}
                          </button>
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