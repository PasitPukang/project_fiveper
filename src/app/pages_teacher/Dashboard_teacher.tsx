import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { projectService } from '../services/api';

interface Project {
  id: number;
  name: string;
  course: string;
  status: string;
  student?: string;
  progress?: number;
}

export function Dashboard_teacher() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const teacherName = currentUser?.name || 'ดร.สมหญิง มีชัย';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsJson = await projectService.getProjects();
        setProjects(projectsJson || []);
      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalProjects = projects.length;
  const totalCompleted = projects.filter((p) => p.status === 'เสร็จสิ้น').length;
  const inProgress = projects.filter((p) => p.status === 'กำลังดำเนินการ').length;

  // Aggregate per course dynamically
  const courseMap: Record<string, { projects: number; completed: number }> = {};
  projects.forEach((p) => {
    const course = p.course || 'CS 101';
    if (!courseMap[course]) {
      courseMap[course] = { projects: 0, completed: 0 };
    }
    courseMap[course].projects += 1;
    if (p.status === 'เสร็จสิ้น') {
      courseMap[course].completed += 1;
    }
  });

  const chartData = Object.keys(courseMap).map((course, idx) => ({
    id: idx + 1,
    course,
    projects: courseMap[course].projects,
    completed: courseMap[course].completed,
  }));

  const totalCourses = Object.keys(courseMap).length;

  const summaryData = [
    { title: 'โครงการทั้งหมด', value: totalProjects, icon: FolderKanban, color: 'bg-green-500' },
    { title: 'กำลังดำเนินการ', value: inProgress, icon: Clock, color: 'bg-yellow-500' },
    { title: 'เสร็จสิ้น', value: totalCompleted, icon: CheckCircle, color: 'bg-green-600' },
    { title: 'จำนวนวิชาที่ดูแล', value: totalCourses, icon: AlertCircle, color: 'bg-blue-500' },
  ];

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดข้อมูลแดชบอร์ดอาจารย์...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-gray-900 font-bold">แดชบอร์ดอาจารย์</h1>
        <p className="text-gray-600 mt-1">ยินดีต้อนรับอาจารย์ประจำวิชา ({teacherName})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.title}</p>
                    <p className="text-3xl mt-2 text-gray-900 font-bold">{item.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ความก้าวหน้าโครงการแยกตามวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="course" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="projects" fill="#16a34a" name="โครงการทั้งหมด" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" fill="#22c55e" name="เสร็จสิ้น" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>โครงการล่าสุดในความดูแล</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm">ไม่มีข้อมูลโครงการ</p>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600">นิสิต: {project.student || 'สมชาย ใจดี'} ({project.course || 'CS 101'})</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-medium">
                      {project.status || 'กำลังดำเนินการ'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}