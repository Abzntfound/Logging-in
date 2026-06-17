// A&M Hair & Beauty — AUTH FIXED (NON MODULE SAFE)

const supabase = window.supabaseClient;

if (!supabase) {
    console.error("Supabase not loaded!");
}

/* =========================
   HELPERS
========================= */

function getUserData() {
    return JSON.parse(localStorage.getItem("amUserData") || "null");
}

function saveUserData(user, profile) {
    localStorage.setItem("amUserData", JSON.stringify({
        id: user.id,
        email: user.email,
        name: profile?.name || ""
    }));
}

/* =========================
   CORE
========================= */

async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data?.user || null;
}

async function getProfile(id) {
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    return data || null;
}

/* =========================
   LOGIN
========================= */

async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        showMessage(error.message, "error");
        return;
    }

    const profile = await getProfile(data.user.id);
    saveUserData(data.user, profile);

    showProfile(data.user, profile);
}

/* =========================
   SIGNUP
========================= */

async function signup(name, email, password) {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
    });

    if (error) return showMessage(error.message, "error");

    showMessage("Check your email to confirm account", "success");
}

/* =========================
   UI
========================= */

function showProfile(user, profile) {
    document.getElementById("auth-container").style.display = "none";
    document.getElementById("user-profile").style.display = "block";

    document.getElementById("user-name-display").innerText =
        profile?.name || user.email;

    document.getElementById("user-email-display").innerText =
        user.email;
}

function showAuth() {
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("user-profile").style.display = "none";
}

/* =========================
   MESSAGE
========================= */

function showMessage(text, type) {
    const el = document.getElementById("auth-message");
    if (!el) return;

    el.innerText = text;
    el.style.display = "block";
    el.style.color = type === "error" ? "red" : "green";
}

/* =========================
   EVENTS
========================= */

window.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("login-form")?.addEventListener("submit", e => {
        e.preventDefault();
        login(
            document.getElementById("login-email").value,
            document.getElementById("login-password").value
        );
    });

    document.getElementById("signup-form")?.addEventListener("submit", e => {
        e.preventDefault();
        signup(
            document.getElementById("signup-name").value,
            document.getElementById("signup-email").value,
            document.getElementById("signup-password").value
        );
    });

    document.getElementById("logout-btn")?.addEventListener("click", async () => {
        await supabase.auth.signOut();
        location.reload();
    });

    const user = await getUser();
    if (user) {
        const profile = await getProfile(user.id);
        showProfile(user, profile);
    } else {
        showAuth();
    }
});

console.log("AUTH FIXED ✔");
