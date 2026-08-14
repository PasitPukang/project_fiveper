import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FolderKanban, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { chartService, projectService } from '../services/api';

interface ChartItem {
  id: number;
  course: string;
  projects: number;
  completed: number;
}

interface Project {
  id: number;
  name: string;
  student?: string;
  course?: string;
  status?: string;
}

export function Dashboard_student() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [studentProjects, setStudentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
  const studentName = currentUser?.name || 'สมชาย ใจดี';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chartJson, projectsJson] = await Promise.all([
          chartService.getChartData(),
          projectService.getProjects(),
        ]);

        // Filter projects for this specific student
        const filteredProjects = (projectsJson || []).filter(
          (p: Project) => p.student === studentName || !p.student || p.student.includes(studentName.split(' ')[0])
        );

        setStudentProjects(filteredProjects);

        // Group student's projects by course for the chart
        const courseMap: Record<string, { projects: number; completed: number }> = {};
        filteredProjects.forEach((p: Project) => {
          const course = p.course || 'CS 101';
          if (!courseMap[course]) {
            courseMap[course] = { projects: 0, completed: 0 };
          }
          courseMap[course].projects += 1;
          if (p.status === 'เสร็จสิ้น') {
            courseMap[course].completed += 1;
          }
        });

        const customChart = Object.keys(courseMap).map((course, idx) => ({
          id: idx + 1,
          course,
          projects: courseMap[course].projects,
          completed: courseMap[course].completed,
        }));

        setChartData(customChart.length > 0 ? customChart : (chartJson || []));
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentName]);

  const totalProjects = studentProjects.length;
  const totalCompleted = studentProjects.filter((p) => p.status === 'เสร็จสิ้น').length;
  const inProgress = studentProjects.filter((p) => p.status === 'กำลังดำเนินการ').length;
  const uniqueCourses = new Set(studentProjects.map((p) => p.course)).size;

  const summaryData = [
    { title: 'โครงการของฉัน', value: totalProjects || 1, icon: FolderKanban, color: 'bg-green-500' },
    { title: 'กำลังดำเนินการ', value: inProgress || 1, icon: Clock, color: 'bg-yellow-500' },
    { title: 'เสร็จสิ้น', value: totalCompleted || 0, icon: CheckCircle, color: 'bg-green-600' },
    { title: 'จำนวนวิชาที่เรียน', value: uniqueCourses || 1, icon: AlertCircle, color: 'bg-red-500' },
  ];

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดข้อมูลแดชบอร์ด...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-gray-900">แดชบอร์ดนิสิต</h1>
        <p className="text-gray-600 mt-1">ยินดีต้อนรับคุณ {studentName}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.title}</p>
                    <p className="text-3xl mt-2 text-gray-900">{item.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ความก้าวหน้าโครงการของฉันแยกตามวิชา</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="course" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="projects" fill="#16a34a" name="โครงการทั้งหมด" />
                <Bar dataKey="completed" fill="#22c55e" name="เสร็จสิ้น" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>โครงการของฉันล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {studentProjects.length === 0 ? (
              <p className="text-gray-500 text-sm">ไม่มีข้อมูลโครงการ</p>
            ) : (
              <div className="space-y-4">
                {studentProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600">รายวิชา: {project.course || 'CS 101'}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
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