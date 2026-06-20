// ======================================================
// A&M HAIR & BEAUTY — CLEAN AUTH SYSTEM (FULL REWRITE)
// ======================================================

// ===================== SUPABASE INIT ====================
const SUPABASE_URL = "https://bipejrjipvoqvkwuzftz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcGVqcmppcHZvcXZrd3V6ZnR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzYzMjMsImV4cCI6MjA5NzIxMjMyM30.Z8V7chc-UOK2UU5dxBydgLbT0u1DUv2_DGtisLmZWq4"; // <-- replace with your real anon key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
}

// ===================== SIGNUP =====================
async function signup(name, email, password) {
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
}

// ===================== LOGOUT =====================
async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("am_user");
    location.reload();
}

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
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("user-profile").style.display = "block";

    document.getElementById("user-email-display").innerText = user.email;

    document.getElementById("user-name-display").innerText =
        user.profile?.name || "User";

    // admin check
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

        signup(
            document.getElementById("signup-name").value,
            document.getElementById("signup-email").value,
            document.getElementById("signup-password").value
        );
    });

    document.getElementById("logout-btn")?.addEventListener("click", logout);

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

console.log("A&M CLEAN SYSTEM LOADED ✔");
