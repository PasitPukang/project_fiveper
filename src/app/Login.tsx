import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader } from './components/ui/card';
import React from 'react';
import { supabase } from './supabaseClient';

const roleRedirectMap: Record<string, string> = {
  'ผู้ดูแลระบบ': '/',
  'อาจารย์': '/teacher',
  'นักศึกษา': '/student',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const performDemoLogin = (roleName: string, demoEmail: string, demoName: string) => {
    const user = {
      id: Date.now(),
      name: demoName,
      email: demoEmail,
      role: roleName,
    };
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    const redirectTo = roleRedirectMap[roleName] ?? '/';
    navigate(redirectTo, { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('กรุณากรอก Email และรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      // 🚀 Direct Supabase Cloud Authentication
      const { data, error: dbError } = await supabase
        .from('pf_users')
        .select('*')
        .eq('email', email)
        .single();

      if (!dbError && data) {
        const user = {
          id: data.id,
          userId: data.user_id,
          name: data.name,
          email: data.email,
          role: data.role,
        };
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        const redirectTo = roleRedirectMap[user.role] ?? '/';
        navigate(redirectTo, { replace: true });
        return;
      }
    } catch (err) {
      console.warn('Supabase authentication check:', err);
    }

    // Demo Fallback Login when offline or custom credentials entered
    let detectedRole = 'ผู้ดูแลระบบ';
    let defaultName = 'ผู้ดูแลระบบ';

    if (email.toLowerCase().includes('teacher') || email.includes('อาจารย์')) {
      detectedRole = 'อาจารย์';
      defaultName = 'ดร.สมหญิง มีชัย';
    } else if (email.toLowerCase().includes('student') || email.includes('นิสิต') || email.includes('นักศึกษา')) {
      detectedRole = 'นักศึกษา';
      defaultName = 'สมชาย ใจดี';
    }

    performDemoLogin(detectedRole, email, defaultName);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 -z-10"></div>

      <Card className="w-full max-w-md shadow-lg" style={{ borderRadius: '12px' }}>
        <CardHeader className="space-y-6 pt-8 pb-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center shadow-md">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1695556575317-9d49e3dccf75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwbG9nbyUyMGFjYWRlbWljJTIwZW1ibGVtfGVufDF8fHx8MTc3MjQ2NjM0MXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="University Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-bold text-gray-900">ระบบติดตามการดำเนินงานของนิสิต</h1>
            <p className="text-xs text-gray-600">เข้าสู่ระบบเพื่อใช้งานในบทบาทต่างๆ (Supabase Cloud)</p>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-5">
          
          {/* Quick Demo Login Presets */}
          <div className="bg-green-50/70 p-3 rounded-xl border border-green-200/80 space-y-2 text-xs">
            <p className="text-gray-600 font-medium text-center">ทดลองเข้าสู่ระบบตามบทบาท (Demo Login)</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => performDemoLogin('ผู้ดูแลระบบ', 'admin@ku.th', 'ผู้ดูแลระบบ')}
                className="py-1.5 px-1 rounded-lg bg-white border border-green-300 text-green-800 font-semibold hover:bg-green-100 transition text-[11px]"
              >
                ผู้ดูแลระบบ
              </button>
              <button
                type="button"
                onClick={() => performDemoLogin('อาจารย์', 'teacher@ku.th', 'ดร.สมหญิง มีชัย')}
                className="py-1.5 px-1 rounded-lg bg-white border border-green-300 text-green-800 font-semibold hover:bg-green-100 transition text-[11px]"
              >
                อาจารย์
              </button>
              <button
                type="button"
                onClick={() => performDemoLogin('นักศึกษา', 'student@ku.th', 'สมชาย ใจดี')}
                className="py-1.5 px-1 rounded-lg bg-white border border-green-300 text-green-800 font-semibold hover:bg-green-100 transition text-[11px]"
              >
                นิสิต
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น admin@ku.th, teacher@ku.th, student@ku.th"
                className="h-10 text-xs"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน (รหัสใดก็ได้)"
                className="h-10 text-xs"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-green-600 hover:bg-green-700 text-white font-medium text-xs rounded-xl"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}