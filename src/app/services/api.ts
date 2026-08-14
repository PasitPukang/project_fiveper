// Central Hybrid API & Supabase Cloud Integration Service for project_fiveper

import { supabase } from '../supabaseClient';

const BASE_URL = 'http://localhost:8080/api/v1';

// Default Seed Data
const DEFAULT_USERS = [
  { id: 1, userId: 'ADM001', name: 'ผู้ดูแลระบบ', email: 'admin@ku.th', role: 'ผู้ดูแลระบบ' },
  { id: 2, userId: 'INS001', name: 'ดร.สมหญิง มีชัย', email: 'teacher@ku.th', role: 'อาจารย์' },
  { id: 3, userId: 'STU001', name: 'สมชาย ใจดี', email: 'student@ku.th', role: 'นักศึกษา' },
  { id: 4, userId: 'STU002', name: 'สมหญิง ใจงาม', email: 'somying.j@university.ac.th', role: 'นักศึกษา' },
  { id: 5, userId: 'INS002', name: 'ศ.ดร.สมชาย วิชาการ', email: 'somchai.w@university.ac.th', role: 'อาจารย์' },
];

const DEFAULT_PROJECTS = [
  { id: 1, name: 'โครงการพัฒนาเว็บไซต์', description: 'สร้างเว็บไซต์ที่รองรับหลายขนาดหน้าจอ', course: 'CS 101', dueDate: '2026-03-15', status: 'กำลังดำเนินการ', student: 'สมชาย ใจดี', progress: 75 },
  { id: 2, name: 'การออกแบบฐานข้อมูล', description: 'ออกแบบและสร้างโครงสร้างฐานข้อมูล', course: 'CS 201', dueDate: '2026-03-20', status: 'กำลังดำเนินการ', student: 'สมหญิง ใจงาม', progress: 45 },
  { id: 3, name: 'โมเดลแมชชีนเลิร์นนิง', description: 'ฝึกโมเดลการจำแนกประเภท', course: 'CS 301', dueDate: '2026-04-01', status: 'ยังไม่เริ่ม', student: 'สมศักดิ์ ทรงไทย', progress: 0 },
  { id: 4, name: 'แอปพลิเคชันมือถือ', description: 'พัฒนาแอป Android และ iOS', course: 'CS 101', dueDate: '2026-02-28', status: 'เสร็จสิ้น', student: 'พุทธพร เหลืองสีเพชร', progress: 100 },
];

const DEFAULT_MILESTONES = [
  { id: 1, name: 'การวางแผนโครงการ', dueDate: '2026-03-05', status: 'เสร็จสิ้น', progress: 100, isApproved: true },
  { id: 2, name: 'การออกแบบ UI', dueDate: '2026-03-10', status: 'กำลังดำเนินการ', progress: 60, isApproved: true },
  { id: 3, name: 'พัฒนา Backend', dueDate: '2026-03-15', status: 'กำลังดำเนินการ', progress: 30, isApproved: false },
  { id: 4, name: 'ทดสอบและเผยแพร่', dueDate: '2026-03-20', status: 'ยังไม่เริ่ม', progress: 0, isApproved: false },
];

const DEFAULT_FEEDBACK = [
  { id: 1, comment: 'ความก้าวหน้าของการออกแบบ UI เป็นไปด้วยดี โปรดเน้นเรื่อง Responsive Design สำหรับอุปกรณ์มือถือเพิ่มเติม', instructorName: 'ดร.สมหญิง มีชัย', date: '2026-02-28', projectName: 'โครงการพัฒนาเว็บไซต์', isRead: true, replyComment: 'ขอบคุณครับอาจารย์ กำลังปรับแต่ง Tailwind breakpoints ครับ' },
  { id: 2, comment: 'โครงสร้างฐานข้อมูลมีความเหมาะสม แนะนำให้เพิ่ม Index เพื่อเพิ่มประสิทธิภาพ', instructorName: 'ศ.ดร.สมชาย วิชาการ', date: '2026-02-27', projectName: 'การออกแบบฐานข้อมูล', isRead: false, replyComment: '' },
  { id: 3, comment: 'การเตรียมการเริ่มต้นดีมาก อย่าลืมทำเอกสารประกอบโค้ดให้ครบถ้วน', instructorName: 'ดร.สมหญิง มีชัย', date: '2026-02-25', projectName: 'โครงการพัฒนาเว็บไซต์', isRead: true, replyComment: '' },
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: 'มีข้อเสนอแนะใหม่', message: 'ดร.สมหญิง มีชัย ได้ส่งข้อเสนอแนะในโครงการพัฒนาเว็บไซต์', isRead: false, date: '2026-02-28' },
  { id: 2, title: 'แจ้งเตือนวันครบกำหนด', message: 'เป้าหมาย การออกแบบ UI ใกล้ครบกำหนดใน 3 วัน', isRead: true, date: '2026-03-07' },
];

const DEFAULT_CHART = [
  { id: 1, course: 'CS 101', projects: 4, completed: 3 },
  { id: 2, course: 'CS 201', projects: 3, completed: 2 },
  { id: 3, course: 'CS 301', projects: 5, completed: 1 },
];

// LocalStorage Helpers
function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`pf_${key}`);
    if (item) return JSON.parse(item);
  } catch (e) {}
  return defaultValue;
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`pf_${key}`, JSON.stringify(value));
  } catch (e) {}
}

// --- API Services with Supabase Integration ---

export const userService = {
  getUsers: async () => {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_users').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted = data.map(u => ({
          id: u.id,
          userId: u.user_id,
          name: u.name,
          email: u.email,
          role: u.role
        }));
        setLocal('users', formatted);
        return formatted;
      }
    } catch (e) {}

    return getLocal('users', DEFAULT_USERS);
  },

  addUser: async (user: any) => {
    try {
      const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_users').insert([{
        user_id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        password_hash: user.password
      }]).select();
      if (!error && data && data.length > 0) {
        const newUser = { id: data[0].id, userId: data[0].user_id, name: data[0].name, email: data[0].email, role: data[0].role };
        const current = getLocal('users', DEFAULT_USERS);
        setLocal('users', [...current, newUser]);
        return newUser;
      }
    } catch (e) {}

    const current = getLocal('users', DEFAULT_USERS);
    const newUser = { ...user, id: Date.now() };
    setLocal('users', [...current, newUser]);
    return newUser;
  },

  updateUser: async (id: number, user: any) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      await supabase.from('pf_users').update({
        user_id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }).eq('id', id);
    } catch (e) {}

    const current = getLocal('users', DEFAULT_USERS);
    const updated = current.map((u: any) => (u.id === id ? { ...u, ...user } : u));
    setLocal('users', updated);
    return { ...user, id };
  },

  deleteUser: async (id: number) => {
    try {
      await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
    } catch (e) {}

    try {
      await supabase.from('pf_users').delete().eq('id', id);
    } catch (e) {}

    const current = getLocal('users', DEFAULT_USERS);
    const updated = current.filter((u: any) => u.id !== id);
    setLocal('users', updated);
  },
};

export const projectService = {
  getProjects: async () => {
    try {
      const res = await fetch(`${BASE_URL}/projects`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_projects').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted = data.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          course: p.course,
          dueDate: p.due_date,
          status: p.status,
          student: p.student,
          progress: p.progress,
          attachmentUrl: p.attachment_url
        }));
        setLocal('projects', formatted);
        return formatted;
      }
    } catch (e) {}

    return getLocal('projects', DEFAULT_PROJECTS);
  },

  addProject: async (project: any) => {
    try {
      const res = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_projects').insert([{
        name: project.name,
        description: project.description,
        course: project.course,
        due_date: project.dueDate,
        status: project.status || 'กำลังดำเนินการ',
        student: project.student || 'นิสิต',
        progress: project.progress || 0,
        attachment_url: project.attachmentUrl || null
      }]).select();
      if (!error && data && data.length > 0) {
        const newProj = {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description,
          course: data[0].course,
          dueDate: data[0].due_date,
          status: data[0].status,
          student: data[0].student,
          progress: data[0].progress,
          attachmentUrl: data[0].attachment_url
        };
        const current = getLocal('projects', DEFAULT_PROJECTS);
        setLocal('projects', [...current, newProj]);
        return newProj;
      }
    } catch (e) {}

    const current = getLocal('projects', DEFAULT_PROJECTS);
    const newProject = { ...project, id: Date.now(), progress: project.progress || 0 };
    setLocal('projects', [...current, newProject]);
    return newProject;
  },

  updateProject: async (id: number, project: any) => {
    try {
      const res = await fetch(`${BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      await supabase.from('pf_projects').update({
        name: project.name,
        description: project.description,
        course: project.course,
        due_date: project.dueDate,
        status: project.status,
        student: project.student,
        progress: project.progress
      }).eq('id', id);
    } catch (e) {}

    const current = getLocal('projects', DEFAULT_PROJECTS);
    const updated = current.map((p: any) => (p.id === id ? { ...p, ...project } : p));
    setLocal('projects', updated);
    return { ...project, id };
  },

  deleteProject: async (id: number) => {
    try {
      await fetch(`${BASE_URL}/projects/${id}`, { method: 'DELETE' });
    } catch (e) {}

    try {
      await supabase.from('pf_projects').delete().eq('id', id);
    } catch (e) {}

    const current = getLocal('projects', DEFAULT_PROJECTS);
    const updated = current.filter((p: any) => p.id !== id);
    setLocal('projects', updated);
  },
};

export const milestoneService = {
  getMilestones: async () => {
    try {
      const res = await fetch(`${BASE_URL}/milestones`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_milestones').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        const formatted = data.map(m => ({
          id: m.id,
          name: m.name,
          dueDate: m.due_date,
          status: m.status,
          progress: m.progress,
          isApproved: m.is_approved
        }));
        setLocal('milestones', formatted);
        return formatted;
      }
    } catch (e) {}

    return getLocal('milestones', DEFAULT_MILESTONES);
  },

  addMilestone: async (milestone: any) => {
    try {
      const res = await fetch(`${BASE_URL}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_milestones').insert([{
        name: milestone.name,
        due_date: milestone.dueDate,
        status: milestone.status || 'ยังไม่เริ่ม',
        progress: milestone.progress || 0,
        is_approved: false
      }]).select();
      if (!error && data && data.length > 0) {
        const newM = { id: data[0].id, name: data[0].name, dueDate: data[0].due_date, status: data[0].status, progress: data[0].progress, isApproved: false };
        const current = getLocal('milestones', DEFAULT_MILESTONES);
        setLocal('milestones', [...current, newM]);
        return newM;
      }
    } catch (e) {}

    const current = getLocal('milestones', DEFAULT_MILESTONES);
    const newMilestone = { ...milestone, id: Date.now(), isApproved: false };
    setLocal('milestones', [...current, newMilestone]);
    return newMilestone;
  },

  updateMilestone: async (id: number, milestone: any) => {
    try {
      const res = await fetch(`${BASE_URL}/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      await supabase.from('pf_milestones').update({
        name: milestone.name,
        due_date: milestone.dueDate,
        status: milestone.status,
        progress: milestone.progress,
        is_approved: milestone.isApproved
      }).eq('id', id);
    } catch (e) {}

    const current = getLocal('milestones', DEFAULT_MILESTONES);
    const updated = current.map((m: any) => (m.id === id ? { ...m, ...milestone } : m));
    setLocal('milestones', updated);
    return { ...milestone, id };
  },
};

export const feedbackService = {
  getFeedback: async () => {
    try {
      const res = await fetch(`${BASE_URL}/feedback`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_feedback').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        const formatted = data.map(f => ({
          id: f.id,
          comment: f.comment,
          instructorName: f.instructor_name,
          date: f.date,
          projectName: f.project_name,
          isRead: f.is_read || false,
          replyComment: f.reply_comment || ''
        }));
        setLocal('feedback', formatted);
        return formatted;
      }
    } catch (e) {}

    return getLocal('feedback', DEFAULT_FEEDBACK);
  },

  addFeedback: async (item: any) => {
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_feedback').insert([{
        comment: item.comment,
        instructor_name: item.instructorName,
        date: item.date || new Date().toISOString().split('T')[0],
        project_name: item.projectName,
        is_read: false,
        reply_comment: ''
      }]).select();
      if (!error && data && data.length > 0) {
        const newF = { id: data[0].id, comment: data[0].comment, instructorName: data[0].instructor_name, date: data[0].date, projectName: data[0].project_name, isRead: false, replyComment: '' };
        const current = getLocal('feedback', DEFAULT_FEEDBACK);
        setLocal('feedback', [newF, ...current]);
        return newF;
      }
    } catch (e) {}

    const current = getLocal('feedback', DEFAULT_FEEDBACK);
    const newItem = { ...item, id: Date.now(), isRead: false, replyComment: '' };
    setLocal('feedback', [newItem, ...current]);
    return newItem;
  },

  replyFeedback: async (id: number, replyText: string) => {
    try {
      await supabase.from('pf_feedback').update({
        reply_comment: replyText,
        is_read: true
      }).eq('id', id);
    } catch (e) {}

    const current = getLocal('feedback', DEFAULT_FEEDBACK);
    const updated = current.map((f: any) => (f.id === id ? { ...f, replyComment: replyText, isRead: true } : f));
    setLocal('feedback', updated);
    return { id, replyComment: replyText, isRead: true };
  },

  markAsRead: async (id: number) => {
    try {
      await supabase.from('pf_feedback').update({ is_read: true }).eq('id', id);
    } catch (e) {}

    const current = getLocal('feedback', DEFAULT_FEEDBACK);
    const updated = current.map((f: any) => (f.id === id ? { ...f, isRead: true } : f));
    setLocal('feedback', updated);
  }
};

export const notificationService = {
  getNotifications: async () => {
    try {
      const { data, error } = await supabase.from('pf_notifications').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocal('notifications', data);
        return data;
      }
    } catch (e) {}
    return getLocal('notifications', DEFAULT_NOTIFICATIONS);
  },

  markAsRead: async (id: number) => {
    try {
      await supabase.from('pf_notifications').update({ is_read: true }).eq('id', id);
    } catch (e) {}
    const current = getLocal('notifications', DEFAULT_NOTIFICATIONS);
    const updated = current.map((n: any) => (n.id === id ? { ...n, isRead: true } : n));
    setLocal('notifications', updated);
  }
};

export const chartService = {
  getChartData: async () => {
    try {
      const res = await fetch(`${BASE_URL}/chart`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const { data, error } = await supabase.from('pf_chart').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocal('chart', data);
        return data;
      }
    } catch (e) {}

    return getLocal('chart', DEFAULT_CHART);
  },
};
