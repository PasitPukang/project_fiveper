import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import React from 'react';
import { userService } from '../services/api';

interface User {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    role: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const data = await userService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ userId: '', name: '', email: '', role: '', password: '' });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?')) return;
    await userService.deleteUser(id);
    await loadUsers();
  };

  const handleSaveUser = async () => {
    if (!formData.userId || !formData.name || !formData.email || !formData.role) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (!editingUser && !formData.password) {
      alert('กรุณากรอกรหัสผ่าน');
      return;
    }

    if (editingUser) {
      await userService.updateUser(editingUser.id, formData);
    } else {
      await userService.addUser(formData);
    }
    setIsModalOpen(false);
    await loadUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ผู้ดูแลระบบ':
        return 'bg-purple-100 text-purple-800';
      case 'อาจารย์':
        return 'bg-blue-100 text-blue-800';
      case 'นักศึกษา':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <p className="p-6 text-gray-500">กำลังโหลดข้อมูลผู้ใช้...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-gray-600 mt-1">จัดการผู้ใช้และสิทธิ์การเข้าถึงระบบ</p>
        </div>
        <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสผู้ใช้</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead className="text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    ไม่มีข้อมูลผู้ใช้
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-gray-900">{user.userId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">รหัสผู้ใช้</Label>
              <Input
                id="userId"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="เช่น STU001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="กรอกชื่อเต็ม"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@university.ac.th"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">บทบาท</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="นักศึกษา">นักศึกษา</SelectItem>
                  <SelectItem value="อาจารย์">อาจารย์</SelectItem>
                  <SelectItem value="ผู้ดูแลระบบ">ผู้ดูแลระบบ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                รหัสผ่าน {editingUser && <span className="text-gray-400 text-xs">(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? 'กรอกรหัสผ่านใหม่ถ้าต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveUser} className="bg-green-600 hover:bg-green-700">
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}