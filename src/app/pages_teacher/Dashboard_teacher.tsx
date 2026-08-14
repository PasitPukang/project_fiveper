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
}

export function Dashboard_teacher() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chartJson, projectsJson] = await Promise.all([
          chartService.getChartData(),
          projectService.getProjects(),
        ]);

        setChartData(chartJson || []);
        setRecentProjects((projectsJson || []).slice(0, 5));
      } catch (err) {
        console.error('Error fetching teacher dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalProjects = chartData.reduce((sum, item) => sum + (item.projects || 0), 0);
  const totalCompleted = chartData.reduce((sum, item) => sum + (item.completed || 0), 0);
  const inProgress = Math.max(0, totalProjects - totalCompleted);

  const summaryData = [
    { title: 'โครงการทั้งหมด', value: totalProjects || 4, icon: FolderKanban, color: 'bg-green-500' },
    { title: 'กำลังดำเนินการ', value: inProgress || 2, icon: Clock, color: 'bg-yellow-500' },
    { title: 'เสร็จสิ้น', value: totalCompleted || 2, icon: CheckCircle, color: 'bg-green-600' },
    { title: 'จำนวนวิชาที่ดูแล', value: chartData.length || 3, icon: AlertCircle, color: 'bg-red-500' },
  ];

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดข้อมูลแดชบอร์ดอาจารย์...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl text-gray-900">แดชบอร์ดอาจารย์</h1>
        <p className="text-gray-600 mt-1">ยินดีต้อนรับอาจารย์ประจำวิชา</p>
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
                <Bar dataKey="projects" fill="#16a34a" name="โครงการทั้งหมด" />
                <Bar dataKey="completed" fill="#22c55e" name="เสร็จสิ้น" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>โครงการล่าสุดในความดูแล</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-sm">ไม่มีข้อมูลโครงการ</p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-600">{project.student || 'นิสิต'}</p>
                    </div>
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