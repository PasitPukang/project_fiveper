// Central API & Hybrid Persistence Service for project_fiveper

const BASE_URL = 'http://localhost:8080';

// Default Seed Data from webdb.sql
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
  { id: 1, name: 'การวางแผนโครงการ', dueDate: '2026-03-05', status: 'เสร็จสิ้น', progress: 100 },
  { id: 2, name: 'การออกแบบ UI', dueDate: '2026-03-10', status: 'กำลังดำเนินการ', progress: 60 },
  { id: 3, name: 'พัฒนา Backend', dueDate: '2026-03-15', status: 'กำลังดำเนินการ', progress: 30 },
  { id: 4, name: 'ทดสอบและเผยแพร่', dueDate: '2026-03-20', status: 'ยังไม่เริ่ม', progress: 0 },
];

const DEFAULT_FEEDBACK = [
  { id: 1, comment: 'ความก้าวหน้าของการออกแบบ UI เป็นไปด้วยดี โปรดเน้นเรื่อง Responsive Design สำหรับอุปกรณ์มือถือเพิ่มเติม', instructorName: 'ดร.สมหญิง มีชัย', date: '2026-02-28', projectName: 'โครงการพัฒนาเว็บไซต์' },
  { id: 2, comment: 'โครงสร้างฐานข้อมูลมีความเหมาะสม แนะนำให้เพิ่ม Index เพื่อเพิ่มประสิทธิภาพ', instructorName: 'ศ.ดร.สมชาย วิชาการ', date: '2026-02-27', projectName: 'การออกแบบฐานข้อมูล' },
  { id: 3, comment: 'การเตรียมการเริ่มต้นดีมาก อย่าลืมทำเอกสารประกอบโค้ดให้ครบถ้วน', instructorName: 'ดร.สมหญิง มีชัย', date: '2026-02-25', projectName: 'โครงการพัฒนาเว็บไซต์' },
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
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }
  return defaultValue;
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`pf_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// Fetch with Fallback Wrapper
async function fetchWithFallback<T>(url: string, storageKey: string, defaultData: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      const data = await res.json();
      setLocal(storageKey, data);
      return data;
    }
  } catch (err) {
    console.warn(`Backend API ${url} unavailable, fallback to LocalStorage/Seed data:`, err);
  }
  return getLocal<T>(storageKey, defaultData);
}

// --- API Service Functions ---

export const userService = {
  getUsers: async () => fetchWithFallback(`${BASE_URL}/users`, 'users', DEFAULT_USERS),
  addUser: async (user: any) => {
    try {
      const res = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const current = getLocal('users', DEFAULT_USERS);
    const newUser = { ...user, id: Date.now() };
    const updated = [...current, newUser];
    setLocal('users', updated);
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
    const current = getLocal('users', DEFAULT_USERS);
    const updated = current.map((u: any) => (u.id === id ? { ...u, ...user } : u));
    setLocal('users', updated);
    return { ...user, id };
  },
  deleteUser: async (id: number) => {
    try {
      await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const current = getLocal('users', DEFAULT_USERS);
    const updated = current.filter((u: any) => u.id !== id);
    setLocal('users', updated);
  },
};

export const projectService = {
  getProjects: async () => fetchWithFallback(`${BASE_URL}/api/project-details`, 'projects', DEFAULT_PROJECTS),
  addProject: async (project: any) => {
    try {
      const res = await fetch(`${BASE_URL}/api/project-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const current = getLocal('projects', DEFAULT_PROJECTS);
    const newProject = { ...project, id: Date.now(), progress: project.progress || 0 };
    const updated = [...current, newProject];
    setLocal('projects', updated);
    return newProject;
  },
  updateProject: async (id: number, project: any) => {
    try {
      const res = await fetch(`${BASE_URL}/api/project-details/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const current = getLocal('projects', DEFAULT_PROJECTS);
    const updated = current.map((p: any) => (p.id === id ? { ...p, ...project } : p));
    setLocal('projects', updated);
    return { ...project, id };
  },
  deleteProject: async (id: number) => {
    try {
      await fetch(`${BASE_URL}/api/project-details/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const current = getLocal('projects', DEFAULT_PROJECTS);
    const updated = current.filter((p: any) => p.id !== id);
    setLocal('projects', updated);
  },
};

export const milestoneService = {
  getMilestones: async () => fetchWithFallback(`${BASE_URL}/api/milestones`, 'milestones', DEFAULT_MILESTONES),
  addMilestone: async (milestone: any) => {
    try {
      const res = await fetch(`${BASE_URL}/api/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const current = getLocal('milestones', DEFAULT_MILESTONES);
    const newMilestone = { ...milestone, id: Date.now() };
    const updated = [...current, newMilestone];
    setLocal('milestones', updated);
    return newMilestone;
  },
  updateMilestone: async (id: number, milestone: any) => {
    try {
      const res = await fetch(`${BASE_URL}/api/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const current = getLocal('milestones', DEFAULT_MILESTONES);
    const updated = current.map((m: any) => (m.id === id ? { ...m, ...milestone } : m));
    setLocal('milestones', updated);
    return { ...milestone, id };
  },
  deleteMilestone: async (id: number) => {
    try {
      await fetch(`${BASE_URL}/api/milestones/${id}`, { method: 'DELETE' });
    } catch (e) {}
    const current = getLocal('milestones', DEFAULT_MILESTONES);
    const updated = current.filter((m: any) => m.id !== id);
    setLocal('milestones', updated);
  },
};

export const feedbackService = {
  getFeedback: async () => fetchWithFallback(`${BASE_URL}/api/feedback`, 'feedback', DEFAULT_FEEDBACK),
  addFeedback: async (item: any) => {
    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const current = getLocal('feedback', DEFAULT_FEEDBACK);
    const newItem = { ...item, id: Date.now() };
    const updated = [...current, newItem];
    setLocal('feedback', updated);
    return newItem;
  },
};

export const chartService = {
  getChartData: async () => fetchWithFallback(`${BASE_URL}/api/chart`, 'chart', DEFAULT_CHART),
};
