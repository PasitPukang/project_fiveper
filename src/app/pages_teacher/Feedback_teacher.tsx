import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { MessageSquare, User, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import React from 'react';
import { feedbackService, projectService } from '../services/api';

interface FeedbackItem {
  id: number;
  comment: string;
  instructorName: string;
  date: string;
  projectName: string;
}

interface ProjectItem {
  id: number;
  name: string;
  student?: string;
}

export function Feedback_teacher() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fData, pData] = await Promise.all([
        feedbackService.getFeedback(),
        projectService.getProjects(),
      ]);
      setFeedbackData(fData || []);
      setProjects(pData || []);
    } catch (err) {
      console.error('Error loading feedback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitFeedback = async () => {
    if (!selectedProject || !feedbackText) {
      alert('กรุณาเลือกโครงการและกรอกข้อเสนอแนะ');
      return;
    }

    const selectedProjectData = projects.find(
      (p) => p.id.toString() === selectedProject
    );

    setSubmitting(true);
    await feedbackService.addFeedback({
      comment: feedbackText,
      instructorName: 'ดร.สมหญิง มีชัย (อาจารย์ประจำวิชา)',
      date: new Date().toISOString().split('T')[0],
      projectName: selectedProjectData?.name ?? 'โครงการพัฒนาซอฟต์แวร์',
    });

    setFeedbackText('');
    setSelectedProject('');
    setSubmitting(false);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">ข้อเสนอแนะสำหรับนิสิต</h1>
        <p className="text-gray-600 mt-1">บันทึกข้อเสนอแนะและติดตามคำแนะนำ</p>
      </div>

      <Tabs defaultValue="instructor" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="instructor">ให้ข้อเสนอแนะใหม่</TabsTrigger>
          <TabsTrigger value="student">ประวัติข้อเสนอแนะ</TabsTrigger>
        </TabsList>

        <TabsContent value="instructor" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ให้ข้อเสนอแนะนิสิต</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectSelect">เลือกโครงการของนิสิต</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger id="projectSelect">
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} {project.student ? `- ${project.student}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackInput">ข้อเสนอแนะ</Label>
                <Textarea
                  id="feedbackInput"
                  placeholder="กรอกคำแนะนำ ข้อสังเกต หรือแนวทางปรับปรุง..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 font-medium"
              >
                {submitting ? 'กำลังส่ง...' : 'บันทึกข้อเสนอแนะ'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student" className="space-y-4 mt-6">
          {loading ? (
            <p className="p-6 text-gray-500">กำลังโหลดข้อมูล...</p>
          ) : feedbackData.length === 0 ? (
            <p className="text-gray-500 p-6">ยังไม่มีประวัติข้อเสนอแนะ</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>ประวัติข้อเสนอแนะที่เคยบันทึก</CardTitle>
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
                              <p className="text-sm text-gray-900 leading-relaxed">
                                {feedback.comment}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 pl-8">
                            {feedback.instructorName && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{feedback.instructorName}</span>
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
                                {feedback.projectName}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}