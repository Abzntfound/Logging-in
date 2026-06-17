import { supabase } from './supabase.js';

// SIGN UP
export async function signup(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) throw error;
  return data;
}

// LOGIN
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

// LOGOUT
export async function logout() {
  await supabase.auth.signOut();
}

// GET CURRENT USER
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// GET PROFILE (IMPORTANT FOR ROLE)
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}
