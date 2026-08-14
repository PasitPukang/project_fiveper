import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Plus, Edit, Trash2, User, Search, Filter } from 'lucide-react';
import * as React from 'react';
import { projectService } from '../services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  course: string;
  dueDate: string;
  status: string;
  student?: string;
}

export function Projects_teacher() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: '',
    dueDate: '',
    status: '',
    student: '',
  });

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getProjects();
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddProject = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', course: '', dueDate: '', status: 'กำลังดำเนินการ', student: 'สมชาย ใจดี' });
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      course: project.course,
      dueDate: project.dueDate,
      status: project.status,
      student: project.student || 'สมชาย ใจดี',
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('ต้องการลบโครงการนี้ใช่หรือไม่?')) return;
    await projectService.deleteProject(id);
    await loadProjects();
  };

  const handleSaveProject = async () => {
    if (!formData.name || !formData.course || !formData.dueDate) {
      alert('กรุณากรอกข้อมูลให้ครบ (ชื่อโครงการ, รายวิชา, วันครบกำหนด)');
      return;
    }

    setSaving(true);
    if (editingProject) {
      await projectService.updateProject(editingProject.id, formData);
    } else {
      await projectService.addProject(formData);
    }
    setIsModalOpen(false);
    setSaving(false);
    await loadProjects();
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

  // Search & Filter (FR-8)
  const displayedProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.student && p.student.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'ALL' || p.course === filterCourse;
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดข้อมูลโครงการ...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 font-bold">โครงการนิสิตในความดูแล</h1>
          <p className="text-gray-600 mt-1">ติดตาม ตรวจสอบ และประเมินโครงการของนิสิตทั้งหมด</p>
        </div>
        <Button onClick={handleAddProject} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มโครงการ
        </Button>
      </div>

      {/* Search & Filter Controls (FR-8) */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-gray-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาชื่อโครงการ, ชื่อนิสิต..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="รายวิชาทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกรายวิชา</SelectItem>
              <SelectItem value="CS 101">CS 101</SelectItem>
              <SelectItem value="CS 201">CS 201</SelectItem>
              <SelectItem value="CS 301">CS 301</SelectItem>
              <SelectItem value="CS 401">CS 401</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทุกสถานะ</SelectItem>
              <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
              <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
              <SelectItem value="ยังไม่เริ่ม">ยังไม่เริ่ม</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {displayedProjects.length === 0 ? (
            <p className="text-gray-500 p-6 text-center">
              {projects.length === 0 ? 'ไม่มีข้อมูลโครงการ' : 'ไม่พบโครงการที่ตรงกับเงื่อนไขการค้นหา'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อโครงการ</TableHead>
                  <TableHead>นิสิตผู้รับผิดชอบ</TableHead>
                  <TableHead>รายวิชา</TableHead>
                  <TableHead>วันครบกำหนด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <p className="text-gray-900 font-medium">{project.name}</p>
                        <p className="text-xs text-gray-600">{project.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-gray-800">
                        <User className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{project.student || 'สมชาย ใจดี'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.course}</TableCell>
                    <TableCell>
                      {project.dueDate
                        ? new Date(project.dueDate).toLocaleDateString('th-TH')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status || 'กำลังดำเนินการ'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อโครงการ</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="กรอกชื่อโครงการ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">นิสิตผู้รับผิดชอบ</Label>
              <Input
                id="student"
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                placeholder="กรอกชื่อนิสิต"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="กรอกรายละเอียดโครงการ"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">รายวิชา</Label>
              <Select
                value={formData.course}
                onValueChange={(value) => setFormData({ ...formData, course: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกรายวิชา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CS 101">CS 101 - การเขียนโปรแกรมเบื้องต้น</SelectItem>
                  <SelectItem value="CS 201">CS 201 - โครงสร้างข้อมูล</SelectItem>
                  <SelectItem value="CS 301">CS 301 - อัลกอริธึม</SelectItem>
                  <SelectItem value="CS 401">CS 401 - วิศวกรรมซอฟต์แวร์</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">วันครบกำหนด</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ยังไม่เริ่ม">ยังไม่เริ่ม</SelectItem>
                  <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveProject}
              className="bg-green-600 hover:bg-green-700"
              disabled={saving}
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
