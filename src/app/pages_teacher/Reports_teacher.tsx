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
import { projectService } from '../services/api';

interface Project {
  id: number;
  name: string;
  course: string;
  status: string;
  student?: string;
  dueDate?: string;
  progress?: number;
}

export function Reports_teacher() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsJson = await projectService.getProjects();
        setProjects(projectsJson || []);
      } catch (err) {
        console.error('Error fetching teacher reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalProjects = projects.length;
  const totalCompleted = projects.filter((p) => p.status === 'เสร็จสิ้น').length;
  const completionRate = totalProjects > 0
    ? Math.round((totalCompleted / totalProjects) * 100)
    : 0;

  // Group by course dynamically from actual projects database
  const courseMap: Record<string, { total: number; completed: number }> = {};
  projects.forEach((p) => {
    const course = p.course || 'CS 101';
    if (!courseMap[course]) {
      courseMap[course] = { total: 0, completed: 0 };
    }
    courseMap[course].total += 1;
    if (p.status === 'เสร็จสิ้น') {
      courseMap[course].completed += 1;
    }
  });

  const totalCourses = Object.keys(courseMap).length;

  const summaryStats = [
    { label: 'โครงการทั้งหมด', value: String(totalProjects), icon: TrendingUp, color: 'text-green-600' },
    { label: 'อัตราความสำเร็จ', value: `${completionRate}%`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'เสร็จสิ้นแล้ว', value: String(totalCompleted), icon: CheckCircle2, color: 'text-green-600' },
    { label: 'วิชาในความดูแล', value: String(totalCourses), icon: BookOpen, color: 'text-blue-600' },
  ];

  const barChartData = Object.keys(courseMap).map((course) => {
    const total = courseMap[course].total;
    const completed = courseMap[course].completed;
    return {
      course,
      completion: total > 0 ? Math.round((completed / total) * 100) : 0,
      total,
      completed,
    };
  });

  const handleExportPDF = () => {
    alert('ระบบกำลังจัดเตรียมไฟล์รายงานสรุปของอาจารย์...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'เสร็จสิ้น':
        return 'bg-green-100 text-green-800';
      case 'กำลังดำเนินการ':
        return 'bg-yellow-100 text-yellow-800';
      case 'ยังไม่เริ่ม':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดรายงานการเรียนการสอน...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 font-bold">รายงานสำหรับอาจารย์</h1>
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
                    <p className="text-3xl mt-2 text-gray-900 font-bold">{stat.value}</p>
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
                <TableHead>รายวิชา</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลโครงการ
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="text-gray-900 font-medium">{project.name}</TableCell>
                    <TableCell>{project.student || 'สมชาย ใจดี'}</TableCell>
                    <TableCell>{project.course || 'CS 101'}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status || 'กำลังดำเนินการ'}
                      </span>
                    </TableCell>
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