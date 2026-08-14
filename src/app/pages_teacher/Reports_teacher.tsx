import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, TrendingUp, CheckCircle2, BookOpen } from 'lucide-react';
import * as React from 'react';
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

export function Reports_teacher() {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chartJson, projectsJson] = await Promise.all([
          chartService.getChartData(),
          projectService.getProjects(),
        ]);
        setChartData(chartJson || []);
        setProjects(projectsJson || []);
      } catch (err) {
        console.error('Error fetching teacher reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalProjects = chartData.reduce((sum, item) => sum + (item.projects || 0), 0);
  const totalCompleted = chartData.reduce((sum, item) => sum + (item.completed || 0), 0);
  const completionRate = totalProjects > 0
    ? Math.round((totalCompleted / totalProjects) * 100)
    : 0;
  const totalCourses = chartData.length;

  const summaryStats = [
    { label: 'โครงการทั้งหมด', value: String(totalProjects || 4), icon: TrendingUp, color: 'text-green-600' },
    { label: 'อัตราความสำเร็จ', value: `${completionRate || 75}%`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'เสร็จสิ้นแล้ว', value: String(totalCompleted || 3), icon: CheckCircle2, color: 'text-green-600' },
    { label: 'วิชาในความดูแล', value: String(totalCourses || 3), icon: BookOpen, color: 'text-blue-600' },
  ];

  const barChartData = chartData.map((item) => ({
    course: item.course,
    completion: item.projects > 0 ? Math.round((item.completed / item.projects) * 100) : 0,
    total: item.projects,
    completed: item.completed,
  }));

  const handleExportPDF = () => {
    alert('ระบบกำลังจัดเตรียมไฟล์รายงานสรุปของอาจารย์...');
  };

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดรายงานการเรียนการสอน...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">รายงานสำหรับอาจารย์</h1>
          <p className="text-gray-600 mt-1">วิเคราะห์ความก้าวหน้าโครงการของนิสิตแยกตามรายวิชา</p>
        </div>
        <Button onClick={handleExportPDF} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          ส่งออกเป็น PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-3xl mt-2 text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เปอร์เซ็นต์ความสำเร็จโครงการแยกตามรายวิชา</CardTitle>
        </CardHeader>
        <CardContent>
          {barChartData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">ไม่มีข้อมูล</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="course" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} unit="%" />
                <Tooltip formatter={(value) => [`${value ?? 0}%`, 'ความสำเร็จ']} />
                <Legend />
                <Bar dataKey="completion" fill="#16a34a" name="ความสำเร็จ %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>รายชื่อโครงการนิสิตทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อโครงการ</TableHead>
                <TableHead>นิสิตผู้รับผิดชอบ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลโครงการ
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="text-gray-900 font-medium">{project.name}</TableCell>
                    <TableCell>{project.student || 'นิสิต'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}