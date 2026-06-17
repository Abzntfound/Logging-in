// A&M Hair & Beauty — Supabase Auth System (CLEAN VERSION)

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = "https://bipejrjipvoqvkwuzftz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcGVqcmppcHZvcXZrd3V6ZnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzYzMjMsImV4cCI6MjA5NzIxMjMyM30.Z8V7chc-UOK2UU5dxBydgLbT0u1DUv2_DGtisLmZWq4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// STORAGE HELPERS (kept for UI compatibility)
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
    console.log("💾 User cached locally");
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
// SUPABASE CORE FUNCTIONS
// ========================================

async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
}

async function getProfile(userId) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) return null;
    return data;
}

// ========================================
// AUTH ACTIONS
// ========================================

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
// SESSION CHECK
// ========================================

async function checkLoginStatus() {
    const user = await getUser();
    if (!user) return;

    const profile = await getProfile(user.id);
    saveUserData(user, profile);

    showUserProfile({
        ...user,
        ...profile
    });
}

// ========================================
// LOGIN FORM
// ========================================

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const btn = e.target.querySelector("button");
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
        await login(email, password);

        showMessage("✅ Login successful!", "success");

        setTimeout(() => {
            window.location.href = "https://www.amhairandbeauty.com";
        }, 1000);

    } catch (err) {
        showMessage("❌ " + err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = old;
    }
});

// ========================================
// SIGNUP FORM
// ========================================

document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirm = document.getElementById("signup-confirm").value;

    if (password !== confirm) {
        showMessage("❌ Passwords do not match", "error");
        return;
    }

    const btn = e.target.querySelector("button");
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
        await signup(name, email, password);

        showMessage("✅ Account created! Please sign in.", "success");

        setTimeout(() => {
            switchToLogin();
        }, 1200);

    } catch (err) {
        showMessage("❌ " + err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = old;
    }
});

// ========================================
// PROFILE UI
// ========================================

function showUserProfile(user) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("user-profile").style.display = "block";

    document.getElementById("user-name-display").textContent =
        user.name || user.user_metadata?.name || "User";

    document.getElementById("user-email-display").textContent = user.email;

    const created = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : "";

    document.getElementById("user-created-display").textContent = created;
}

// ========================================
// LOGOUT BUTTON
// ========================================

document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await logout();
});

// ========================================
// FORM SWITCHING (kept from your UI)
// ========================================

window.switchToSignup = function () {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "flex";
};

window.switchToLogin = function () {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "flex";
};

// ========================================
// MESSAGE SYSTEM (your UI already uses this)
// ========================================

function showMessage(text, type) {
    const el = document.getElementById("auth-message");
    if (!el) return;

    el.style.display = "block";
    el.textContent = text;
    el.className = type;
}

// ========================================
// INIT
// ========================================

window.addEventListener("DOMContentLoaded", () => {
    checkLoginStatus();
});

console.log("✅ Supabase Auth loaded");
