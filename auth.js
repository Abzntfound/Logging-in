// ======================================================
// A&M HAIR & BEAUTY — CLEAN AUTH SYSTEM (FULL REWRITE)
// ======================================================

// Wrapped in an IIFE so top-level const/let bindings live in this
// function's scope instead of the shared global lexical scope.
// That way, even if this script tag somehow gets loaded/executed
// twice on the same page (duplicate <script> tag, stale cache +
// fresh file both served, hot-reload tooling, etc.), the second
// run just gets its own scope instead of throwing
// "Identifier 'supabase' has already been declared".
(function () {

// ===================== SUPABASE INIT ====================
const SUPABASE_URL = "https://bipejrjipvoqvkwuzftz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcGVqcmppcHZvcXZrd3V6ZnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzYzMjMsImV4cCI6MjA5NzIxMjMyM30.Z8V7chc-UOK2UU5dxBydgLbT0u1DUv2_DGtisLmZWq4";

// ------------------------------------------------------------
// Cross-subdomain session storage
// ------------------------------------------------------------
// By default the Supabase SDK persists sessions in localStorage,
// which is scoped per-origin. auth.amhairandbeauty.com (where this
// script runs and where login happens) and amhairandbeauty.com
// (where nav.js renders the header) are different origins, so a
// session saved here used to be invisible there.
//
// This adapter stores the session in a cookie scoped to
// ".amhairandbeauty.com" instead (leading dot = shared across all
// subdomains). nav.js uses this EXACT same adapter — same domain
// string, same cookie name behavior — so both scripts read/write
// the session to the same place. If you change this here, change
// it in nav.js too, or the two will go out of sync again.
const AM_COOKIE_DOMAIN = '.amhairandbeauty.com';

function am_setCookie(name, value, days) {
    const maxAge = days ? `; max-age=${days * 24 * 60 * 60}` : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; domain=${AM_COOKIE_DOMAIN}${maxAge}; secure; samesite=lax`;
}

function am_getCookieRaw(name) {
    const eq = name + '=';
    for (let c of document.cookie.split(';')) {
        c = c.trim();
        if (c.indexOf(eq) === 0) return decodeURIComponent(c.substring(eq.length));
    }
    return null;
}

function am_removeCookie(name) {
    document.cookie = `${name}=; path=/; domain=${AM_COOKIE_DOMAIN}; max-age=0; secure; samesite=lax`;
}

const am_cookieStorage = {
    getItem: (key) => am_getCookieRaw(key),
    setItem: (key, value) => am_setCookie(key, value, 7), // 7-day session cookie, matches typical refresh-token lifetime
    removeItem: (key) => am_removeCookie(key),
};

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storage: am_cookieStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Share this single client with other scripts on the page (reviews.js,
// nav.js, etc). Without this, any script doing `window.supabaseClient`
// gets undefined and silently fails on every call.
window.supabaseClient = supabase;

// ===================== GLOBAL STATE =====================
let currentUser = null;

// ======================================================
// ===================== AUTH CORE =======================
// ======================================================

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

    if (error) {
        console.warn("getProfile error:", error.message);
        return null;
    }

    return data || null;
}

// ===================== LOGIN =====================
async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            showMessage(error.message, "error");
            window.mascotShake?.();
            return;
        }

        const profile = await getProfile(data.user.id);

        currentUser = {
            ...data.user,
            profile
        };

        saveLocalUser(currentUser);

        showMessage("Login successful!", "success");
        window.mascotNod?.();

        showProfile(currentUser);
    } catch (err) {
        console.error("Login threw an exception:", err);
        showMessage("Something went wrong logging in. Check console for details.", "error");
        window.mascotShake?.();
    }
}

// ===================== SIGNUP =====================
async function signup(name, email, password) {
    try {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        if (error) {
            showMessage(error.message, "error");
            window.mascotShake?.();
            return;
        }

        showMessage("Check your email to confirm account", "success");
    } catch (err) {
        console.error("Signup threw an exception:", err);
        showMessage("Something went wrong signing up. Check console for details.", "error");
        window.mascotShake?.();
    }
}

// ===================== LOGOUT =====================
async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("am_user");
    location.reload();
}

// ===================== SETTINGS BUTTON =====================

const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");

settingsBtn?.addEventListener("click", () => {

    if (!settingsPanel) return;

    const isOpen = settingsPanel.style.display === "block";

    settingsPanel.style.display = isOpen ? "none" : "block";

});

// ===================== THEME SETTINGS =====================

const themeButtons = document.querySelectorAll(".theme-btn");

themeButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        const theme = btn.dataset.theme;

        themeButtons.forEach(b =>
            b.classList.remove("active")
        );

        btn.classList.add("active");

        document.body.dataset.theme = theme;

    });

});

document.getElementById("save-settings-btn")
?.addEventListener("click", () => {

    const activeTheme =
        document.querySelector(".theme-btn.active")
        ?.dataset.theme || "dark";


    localStorage.setItem(
        "am_theme",
        activeTheme
    );


    showMessage(
        "Settings saved!",
        "success"
    );

});

// ======================================================
// ===================== LOCAL CACHE =====================
// ======================================================

function saveLocalUser(user) {
    localStorage.setItem("am_user", JSON.stringify(user));
}

function getLocalUser() {
    try {
        return JSON.parse(localStorage.getItem("am_user"));
    } catch {
        return null;
    }
}

// ======================================================
// ===================== UI FUNCTIONS ====================
// ======================================================

function showProfile(user) {

    const authContainer = document.getElementById("auth-container");
    const userProfile = document.getElementById("user-profile");

    // Only run these if they exist (index.html has them, admin doesn't)
    if (authContainer) {
        authContainer.style.display = "none";
    }

    if (userProfile) {
        userProfile.style.display = "block";
    }


    const emailEl = document.getElementById("user-email-display");
    if (emailEl) {
        emailEl.innerText = user.email;
    }


    const nameEl = document.getElementById("user-name-display");
    if (nameEl) {
        nameEl.innerText =
            user.profile?.name || "User";
    }


    const createdEl = document.getElementById("user-created-display");

    if (createdEl) {
        createdEl.innerText = user.created_at
            ? new Date(user.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
            })
            : "Unknown";
    }


    const loginEl = document.getElementById("user-login-display");

    if (loginEl) {
        loginEl.innerText = user.last_sign_in_at
            ? new Date(user.last_sign_in_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric"
            })
            : "Unknown";
    }


    // Admin check
    if (user.profile?.role === "admin") {
        enableAdminMode();
    }
}
function showAuth() {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("user-profile").style.display = "none";
}

// ===================== MESSAGE UI =====================
function showMessage(text, type) {
    const el = document.getElementById("auth-message");
    if (!el) return;

    el.style.display = "block";
    el.innerText = text;

    el.style.color =
        type === "error" ? "#e74c3c" : "#2ecc71";
}

// ======================================================
// ===================== ADMIN MODE ======================
// ======================================================

function enableAdminMode() {
    if (document.getElementById("admin-btn")) return;

    const btn = document.createElement("button");
    btn.id = "admin-btn";
    btn.innerText = "Admin Dashboard";
    btn.style.cssText = "margin-left:10px;padding:6px 10px;";
    btn.onclick = showAdminDashboard;

    document.querySelector("#header")?.appendChild(btn);
}

function showAdminDashboard() {
    if (document.getElementById("admin-panel")) return;

    const panel = document.createElement("div");
    panel.id = "admin-panel";

    panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        background: #fff;
        border: 1px solid #ddd;
        padding: 15px;
        z-index: 9999;
    `;

    panel.innerHTML = `
        <h3>Admin Dashboard</h3>
        <button id="load-users-btn">Load Users</button>
        <div id="admin-users"></div>
        <button id="admin-panel-close">
            Close
        </button>
    `;

    document.body.appendChild(panel);

    document
        .getElementById("load-users-btn")
        .addEventListener("click", loadUsers);

    document
        .getElementById("admin-panel-close")
        .addEventListener("click", () => panel.remove());
}

async function loadUsers() {
    const container = document.getElementById("admin-users");
    const { data, error } = await supabase.from("profiles").select("*");

    if (error) {
        container.innerHTML = `<div style="color:#e74c3c">Error loading users: ${error.message}</div>`;
        return;
    }

    container.innerHTML = (data || [])
        .map(
            (u) => `
            <div style="padding:5px;border-bottom:1px solid #eee">
                ${u.email} — ${u.role}
            </div>
        `
        )
        .join("");

    const savedTheme = localStorage.getItem("am_theme");

    if (savedTheme) {
        document.body.dataset.theme = savedTheme;
}
}

// ======================================================
// ===================== BASKET SYSTEM ===================
// ======================================================

function getBasketKey() {
    return `basket_${currentUser?.id}`;
}

function getBasket() {
    try {
        return JSON.parse(localStorage.getItem(getBasketKey()) || "[]");
    } catch {
        return [];
    }
}

function saveBasket(items) {
    localStorage.setItem(getBasketKey(), JSON.stringify(items));
}

function addToBasket(item) {
    let basket = getBasket();

    const existing = basket.find((i) => i.id === item.id);

    if (existing) existing.qty++;
    else basket.push({ ...item, qty: 1 });

    saveBasket(basket);
}

// ======================================================
// ===================== AUTH INIT =======================
// ======================================================

async function loadUser() {
    const user = await getUser();

    if (!user) {
        showAuth();
        return;
    }

    const profile = await getProfile(user.id);

    currentUser = {
        ...user,
        profile
    };

    saveLocalUser(currentUser);
    showProfile(currentUser);
}

// ======================================================
// ===================== MASCOT SYSTEM (state) ===========
// ======================================================
// NOTE: all DOM queries for mascots/inputs/pupils now happen
// inside DOMContentLoaded below, so elements are guaranteed
// to exist, and "mascots" / "inputs" are each declared once.

let mascots = [];
let inputs = [];
let typingTimer;
let isTalking = false;

const pupilMap = [
    { pupil: "#pupil-p-l", eye: "#eye-p-l" },
    { pupil: "#pupil-p-r", eye: "#eye-p-r" },
    { pupil: "#pupil-o-l", eye: "#eye-o-l" },
    { pupil: "#pupil-o-r", eye: "#eye-o-r" },
    { pupil: "#pupil-d-l", eye: "#eye-d-l" },
    { pupil: "#pupil-d-r", eye: "#eye-d-r" },
    { pupil: "#pupil-y-l", eye: "#eye-y-l" },
    { pupil: "#pupil-y-r", eye: "#eye-y-r" }
];

// -------------------------------
// Animation helper
// -------------------------------
function triggerAnimation(el, className, duration = 600) {
    if (!el) return;

    el.classList.remove("shaking", "nodding");
    void el.offsetWidth; // restart animation
    el.classList.add(className);

    setTimeout(() => {
        el.classList.remove(className);
    }, duration);
}

// -------------------------------
// Group animations
// -------------------------------
function shakeMascots() {
    mascots.forEach(m => triggerAnimation(m, "shaking"));
}

function nodMascots() {
    mascots.forEach(m => triggerAnimation(m, "nodding"));
}

// Random idle behaviour
function randomMascotAction() {
    if (!mascots.length) return;
    const m = mascots[Math.floor(Math.random() * mascots.length)];
    const action = Math.random() > 0.5 ? "shaking" : "nodding";
    triggerAnimation(m, action);
}

// expose for auth system
window.mascotShake = shakeMascots;
window.mascotNod = nodMascots;

// update pupil position based on cursor
function moveEyes(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    pupilMap.forEach(({ pupil, eye }) => {
        const pupilEl = document.querySelector(pupil);
        const eyeEl = document.querySelector(eye);

        if (!pupilEl || !eyeEl) return;

        const rect = eyeEl.getBoundingClientRect();

        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;

        const dx = mouseX - eyeX;
        const dy = mouseY - eyeY;

        const angle = Math.atan2(dy, dx);

        const maxMove = 2.8; // keep inside eye
        const x = Math.cos(angle) * maxMove;
        const y = Math.sin(angle) * maxMove;

        pupilEl.setAttribute("cx", parseFloat(eyeEl.getAttribute("cx")) + x);
        pupilEl.setAttribute("cy", parseFloat(eyeEl.getAttribute("cy")) + y);
    });
}

// start talking
function startTalking() {
    if (isTalking) return;
    isTalking = true;

    mascots.forEach(m => m.classList.add("talking"));
}

// stop talking
function stopTalking() {
    isTalking = false;

    mascots.forEach(m => m.classList.remove("talking"));
}

// typing detection
function handleTyping() {
    startTalking();

    clearTimeout(typingTimer);

    typingTimer = setTimeout(() => {
        stopTalking();
    }, 600); // stops after user pauses typing
}

// ================================
// 😊😢 EMOTION SYSTEM
// ================================

function clearEmotion() {
    mascots.forEach(m => {
        m.classList.remove("happy", "sad");
    });
}

function setHappy() {
    clearEmotion();

    mascots.forEach(m => {
        m.classList.add("happy");
    });

    window.mascotNod?.();
}

function setSad() {
    clearEmotion();

    mascots.forEach(m => {
        m.classList.add("sad");
    });

    window.mascotShake?.();
}

// small reset after emotion plays
function autoResetEmotion(delay = 2000) {
    setTimeout(() => {
        clearEmotion();
    }, delay);
}

// expose globally so auth system can call it
window.mascotHappy = () => {
    setHappy();
    autoResetEmotion();
};

window.mascotSad = () => {
    setSad();
    autoResetEmotion();
};

// ======================================================
// ===================== EVENTS ==========================
// ======================================================

window.addEventListener("DOMContentLoaded", () => {
    // --- auth init ---
    loadUser();

    document.getElementById("login-form")?.addEventListener("submit", (e) => {
        e.preventDefault();

        login(
            document.getElementById("login-email").value,
            document.getElementById("login-password").value
        );
    });

    document.getElementById("signup-form")?.addEventListener("submit", (e) => {
        e.preventDefault();

        const password = document.getElementById("signup-password").value;
        const confirm = document.getElementById("signup-confirm").value;

        if (password !== confirm) {
            showMessage("Passwords do not match", "error");
            window.mascotShake?.();
            return;
        }

        signup(
            document.getElementById("signup-name").value,
            document.getElementById("signup-email").value,
            password
        );
    });

    document.getElementById("logout-btn")?.addEventListener("click", logout);

    // --- login/signup form switching ---
    document.getElementById("switch-to-signup")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("login-form").style.display = "none";
        document.getElementById("signup-form").style.display = "block";
        document.getElementById("auth-title").innerText = "Create Account";
        document.getElementById("auth-subtitle").innerText = "Sign up to get started";
        const msg = document.getElementById("auth-message");
        if (msg) msg.style.display = "none";
    });

    document.getElementById("switch-to-login")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("login-form").style.display = "block";
        document.getElementById("auth-title").innerText = "Welcome Back!";
        document.getElementById("auth-subtitle").innerText = "Sign in to continue shopping";
        const msg = document.getElementById("auth-message");
        if (msg) msg.style.display = "none";
    });

    // --- mascot system init (DOM is ready now) ---
    mascots = Array.from(document.querySelectorAll(".mascot-char"));
    inputs = Array.from(document.querySelectorAll("input, textarea"));

    setInterval(randomMascotAction, 4000);
    window.addEventListener("mousemove", moveEyes);
    window.addEventListener("click", () => shakeMascots());

    inputs.forEach(input => {
        input.addEventListener("input", handleTyping);
    });
});

})();
