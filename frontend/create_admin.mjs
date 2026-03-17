import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wadzwathlewppayiejiw.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZHp3YXRobGV3cHBheWllaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDM3MzksImV4cCI6MjA4ODI3OTczOX0.MPukL_Uuv6YhaWe_sYKskajvgh_ok5HLAs-X56y1mSM'
);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'bbnhd3333@gmail.com',
    password: 'ZAQqaz1234567890_'
  });
  if (error) {
    console.error("Signup error:", error);
  } else {
    console.log("ID:" + data.user.id);
  }
}
run();
