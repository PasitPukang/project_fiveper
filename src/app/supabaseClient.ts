import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vvxxvetiydnxlokncwun.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eHh2ZXRpeWRueGxva25jd3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTE4NzUsImV4cCI6MjA4ODAyNzg3NX0.vF1U_u84wJ61P31ZlT3wV0aF56yJ383bN18jP32l2Y4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
