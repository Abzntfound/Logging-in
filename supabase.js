const SUPABASE_URL = "https://bipejrjipvoqvkwuzftz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcGVqcmppcHZvcXZrd3V6ZnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzYzMjMsImV4cCI6MjA5NzIxMjMyM30.Z8V7chc-UOK2UU5dxBydgLbT0u1DUv2_DGtisLmZWq4";

export const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
