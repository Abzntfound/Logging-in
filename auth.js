/* ================================
   A&M AUTH.JS — FIXED VERSION
================================ */

const supabase = window.supabaseClient;

if (!supabase) {
    console.error("❌ Supabase not found. Check index.html init.");
}

/* ================================
   STORAGE
================================ */

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

function clearUserData() {
    localStorage.removeItem("amUserData");
    sessionStorage.removeItem("amUserData");
}

/* ================================
   SUPABASE CALLS
================================ */

async function getUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        console.error(error);
        return null;
    }

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

/* ================================
   AUTH ACTIONS
================================ */

async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;

    const user = data.user;
    const profile = await getProfile(user.id);

    saveUserData(user, profile);
    showProfileUI(user, profile);

    return data;
}

async function signup(name, email, password) {
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

async function logout() {
    await supabase.auth.signOut();
    clearUserData();
    location.reload();
}

/* ================================
   UI HANDLING
================================ */

function showProfileUI(user, profile) {
    const auth = document.getElementById("auth-container");
    const profileBox = document.getElementById("user-profile");

    if (auth) auth.style.display = "none";
    if (profileBox) profileBox.style.display = "block";

    const nameEl = document.getElementById("user-name-display");
    const emailEl = document.getElementById("user-email-display");
    const createdEl = document.getElementById("user-created-display");

    if (nameEl) nameEl.textContent = profile?.name || user.email;
    if (emailEl) emailEl.textContent = user.email;
    if (createdEl && user.created_at) {
        createdEl.textContent = new Date(user.created_at).toLocaleDateString();
    }
}

function showAuthUI() {
    const auth = document.getElementById("auth-container");
    const profileBox = document.getElementById("user-profile");

    if (auth) auth.style.display = "block";
    if (profileBox) profileBox.style.display = "none";
}

/* ================================
   SESSION CHECK
================================ */

async function checkLoginStatus() {
    const user = await getUser();

    if (!user) {
        showAuthUI();
        return;
    }

    const profile = await getProfile(user.id);

    saveUserData(user, profile);
    showProfileUI(user, profile);
}

/* ================================
   EVENTS
================================ */

window.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            await login(email, password);
        } catch (err) {
            alert(err.message);
        }
    });

    signupForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        try {
            await signup(name, email, password);
            alert("Check your email to confirm account");
        } catch (err) {
            alert(err.message);
        }
    });

    document.getElementById("logout-btn")?.addEventListener("click", logout);
});

console.log("✅ auth.js loaded safely");
