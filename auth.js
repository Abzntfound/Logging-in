// A&M Hair & Beauty — Supabase Auth System (FIXED NON-MODULE)

const supabase = window.supabaseClient;

// ========================================
// STORAGE HELPERS
// ========================================

function saveUserData(user, profile = null) {
    const data = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || "",
        role: profile?.role || "user",
        pfp: profile?.pfp || null,
        darkMode: profile?.dark_mode || false
    };

    localStorage.setItem("amUserData", JSON.stringify(data));
    sessionStorage.setItem("amUserData", JSON.stringify(data));
}

function getUserData() {
    const raw = localStorage.getItem("amUserData");
    return raw ? JSON.parse(raw) : null;
}

function clearUserData() {
    localStorage.removeItem("amUserData");
    sessionStorage.removeItem("amUserData");
}

// ========================================
// SUPABASE CORE
// ========================================

async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
}

async function getProfile(userId) {
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    return data || null;
}

// ========================================
// AUTH
// ========================================

async function signup(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });

    if (error) throw error;
    return data;
}

async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    const user = data.user;
    const profile = await getProfile(user.id);

    saveUserData(user, profile);
    return data;
}

async function logout() {
    await supabase.auth.signOut();
    clearUserData();
    location.reload();
}

// ========================================
// INIT
// ========================================

async function checkLoginStatus() {
    const user = await getUser();
    if (!user) return;

    const profile = await getProfile(user.id);
    saveUserData(user, profile);
}

window.addEventListener("DOMContentLoaded", checkLoginStatus);

console.log("✅ Auth loaded (FIXED NON-MODULE)");
