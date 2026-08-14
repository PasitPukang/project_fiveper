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


// Backend: GET  /api/feedback → List<Feedback> { id, comment, instructorName, date, projectName }
// Backend: POST /api/feedback → Feedback

interface FeedbackItem {
  id: number;
  comment: string;
  instructorName: string;
  date: string;
  projectName: string;
}

const FEEDBACK_API_URL = 'http://localhost:8080/api/feedback'; // ✅ แก้จาก 5173 → 8080
const PROJECTS_API_URL = 'http://localhost:8080/api/projects';

interface ProjectItem {
  id: number;
  name: string;
  student: string;
}



export function Feedback_student() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('')

  // Fetch feedback data from API
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedbackRes, projectsRes] = await Promise.all([
          fetch(FEEDBACK_API_URL),
          fetch(PROJECTS_API_URL),
        ]);
  
        if (!feedbackRes.ok) throw new Error('Failed to fetch feedback');
        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
  
        const feedbackJson: FeedbackItem[] = await feedbackRes.json();
        const projectsJson: ProjectItem[] = await projectsRes.json();
  
        setFeedbackData(feedbackJson);
        setProjects(projectsJson);
  
      } catch (err) {
        console.error(err);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
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
  
    try {
      const response = await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: feedbackText,
          projectName: selectedProjectData?.name ?? '',
        }),
      });
  
      if (!response.ok) throw new Error('Failed to submit');
  
      const newFeedback: FeedbackItem = await response.json();
  
      setFeedbackData((prev) => [newFeedback, ...prev]);
      setFeedbackText('');
      setSelectedProject('');
  
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการส่งข้อเสนอแนะ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900">ข้อเสนอแนะ</h1>
        
      </div>

      <Tabs defaultValue="student" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="student">นักศึกษา</TabsTrigger>
        </TabsList>

        {/* Student View */}
        <TabsContent value="student" className="space-y-4 mt-6">
          {loading ? (
            <p>กำลังโหลดข้อมูล...</p>
          ) : feedbackData.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีข้อเสนอแนะ</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>ข้อเสนอแนะของฉัน</CardTitle>
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
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
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

        {/* Instructor View */}
        <TabsContent value="instructor" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ให้ข้อเสนอแนะ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectSelect">เลือกโครงการ</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger id="projectSelect">
                    <SelectValue placeholder="เลือกโครงการ" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} - {project.student}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedbackInput">ข้อเสนอแนะ</Label>
                <Textarea
                  id="feedbackInput"
                  placeholder="กรอกข้อเสนอแนะของคุณที่นี่..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {submitting ? 'กำลังส่ง...' : 'ส่งข้อเสนอแนะ'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}