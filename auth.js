// A&M Hair and Beauty - Authentication System (WITH URL REDIRECT)
// auth.js

const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzyQsEQCkZ_UaRF9g_h_w3UHVAM4h8V7mEBy3euBlvOZvvAf2KtB9iF4j_GH8LXy1Iw5A/exec';

// ========================================
// COOKIE HELPERS (for cross-subdomain sharing)
// ========================================

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    // CRITICAL: Use .amhairandbeauty.com (with leading dot) to share across all subdomains
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; domain=.amhairandbeauty.com; SameSite=Lax; Secure`;
    console.log('🍪 Cookie set:', name, 'Domain: .amhairandbeauty.com');
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.amhairandbeauty.com;`;
    console.log('🍪 Cookie deleted:', name);
}

// ========================================
// DATA STORAGE (Triple save: localStorage + cookie + sessionStorage)
// ========================================

function saveUserData(user) {
    console.log('💾 Saving user data with TRIPLE storage...');
    
    const userJSON = JSON.stringify(user);
    
    // 1. Save to localStorage (for auth subdomain)
    localStorage.setItem('amUserData', userJSON);
    console.log('✅ Saved to localStorage');
    
    // 2. Save to cookie (for ALL subdomains)
    setCookie('amUserData', userJSON, 30);
    console.log('✅ Saved to cookie');
    
    // 3. Save to sessionStorage (for URL transfer)
    sessionStorage.setItem('amUserData', userJSON);
    console.log('✅ Saved to sessionStorage');
    
    console.log('💾 User data saved successfully to all 3 storages!');
}

function getUserData() {
    // Try localStorage first
    let userData = localStorage.getItem('amUserData');
    
    // If not found, try cookie
    if (!userData) {
        userData = getCookie('amUserData');
        if (userData) {
            localStorage.setItem('amUserData', userData);
            console.log('📱 User data restored from cookie');
        }
    }
    
    // If still not found, try sessionStorage
    if (!userData) {
        userData = sessionStorage.getItem('amUserData');
        if (userData) {
            console.log('📱 User data restored from sessionStorage');
        }
    }
    
    return userData ? JSON.parse(userData) : null;
}

function clearUserData() {
    localStorage.removeItem('amUserData');
    sessionStorage.removeItem('amUserData');
    deleteCookie('amUserData');
    console.log('🗑️ User data cleared from all storages');
}

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Auth system loading...');
    setupEventListeners();
    checkLoginStatus();
    loadTheme();
});

function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Header navigation
    const headerLogo = document.querySelector('.left');
    const headerLogoImg = document.querySelector('.logo');
    const basketHeader = document.getElementById('basket-header');
    
    if (headerLogo) {
        headerLogo.addEventListener('click', () => {
            window.location.href = 'https://www.amhairandbeauty.com';
        });
    }
    
    if (headerLogoImg) {
        headerLogoImg.addEventListener('click', () => {
            window.location.href = 'https://www.amhairandbeauty.com';
        });
    }
    
    if (basketHeader) {
        basketHeader.addEventListener('click', () => {
            window.location.href = 'https://shop.amhairandbeauty.com/cart/';
        });
    }
    
    // Form switching
    const switchToSignupLink = document.getElementById('switch-to-signup');
    const switchToLoginLink = document.getElementById('switch-to-login');
    
    if (switchToSignupLink) {
        switchToSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchToSignup();
        });
    }
    
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            switchToLogin();
        });
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            toggleSettings();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
    
    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            // Redirect to main site (cookie will be available there)
            window.location.href = 'https://www.amhairandbeauty.com';
        });
    }
    
    // Theme buttons
    const themeLightBtn = document.getElementById('theme-light-btn');
    const themeDarkBtn = document.getElementById('theme-dark-btn');
    
    if (themeLightBtn) {
        themeLightBtn.addEventListener('click', () => {
            setTheme('light');
        });
    }
    
    if (themeDarkBtn) {
        themeDarkBtn.addEventListener('click', () => {
            setTheme('dark');
        });
    }
    
    // Save settings button
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveSettings();
        });
    }
    
    console.log('✅ Event listeners attached');
}

// ========================================
// LOGIN STATUS CHECK
// ========================================

function checkLoginStatus() {
    const user = getUserData();
    
    if (user) {
        console.log('✅ User already logged in:', user.email);
        showUserProfile(user);
    } else {
        console.log('ℹ️ No user logged in');
    }
}

// ========================================
// FORM SWITCHING
// ========================================

function switchToSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'flex';
    document.getElementById('auth-title').textContent = 'Create Account';
    document.getElementById('auth-subtitle').textContent = 'Join the A&M family today!';
    hideMessage();
}

function switchToLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('auth-title').textContent = 'Welcome Back!';
    document.getElementById('auth-subtitle').textContent = 'Sign in to continue shopping';
    hideMessage();
}

// ========================================
// MESSAGE HANDLING
// ========================================

function showMessage(text, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = text;
    messageEl.className = type;
    messageEl.style.display = 'block';
    console.log('📢 Message:', text, '| Type:', type);
}

function hideMessage() {
    const messageEl = document.getElementById('auth-message');
    messageEl.style.display = 'none';
}

// ========================================
// API COMMUNICATION
// ========================================

async function makeGoogleSheetsRequest(action, data) {
    console.log('📤 Making request:', action, data);
    
    try {
        const params = new URLSearchParams({
            action: action,
            data: JSON.stringify(data)
        });
        
        const url = `${GOOGLE_SHEETS_URL}?${params.toString()}`;
        console.log('🌐 Request URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow'
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('📄 Response text:', text);
        
        const result = JSON.parse(text);
        console.log('✅ Parsed result:', result);
        
        return result;
    } catch (error) {
        console.error('❌ Request failed:', error);
        throw error;
    }
}

// ========================================
// FORM HANDLERS
// ========================================

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    console.log('🔐 Login attempt for:', email);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Signing in...';
    
    try {
        const result = await makeGoogleSheetsRequest('LOGIN', {
            email: email,
            password: password
        });
        
        if (result.success) {
            showMessage('✅ Login successful! Redirecting...', 'success');
            
            // CRITICAL: Save user data to ALL storages
            saveUserData(result.user);
            
            // Show profile briefly, then redirect to main site
            setTimeout(() => {
                console.log('🔄 Redirecting to main site...');
                window.location.href = 'https://www.amhairandbeauty.com';
            }, 1500);
        } else {
            showMessage('❌ ' + (result.message || 'Login failed. Please check your credentials.'), 'error');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showMessage('⚠️ ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long', 'error');
        return;
    }
    
    console.log('📝 Signup attempt for:', email);
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Creating account...';
    
    try {
        const result = await makeGoogleSheetsRequest('SIGNUP', {
            name: name,
            email: email,
            password: password
        });
        
        if (result.success) {
            showMessage('✅ Account created! You can now sign in.', 'success');
            
            e.target.reset();
            
            setTimeout(() => {
                switchToLogin();
                document.getElementById('login-email').value = email;
            }, 2000);
        } else {
            showMessage('❌ ' + (result.message || 'Signup failed. Please try again.'), 'error');
        }
    } catch (error) {
        console.error('❌ Signup error:', error);
        showMessage('⚠️ ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// ========================================
// USER PROFILE
// ========================================

function showUserProfile(user) {
    console.log('👤 Showing profile for:', user.name);
    
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('user-profile').style.display = 'block';
    
    document.getElementById('user-name-display').textContent = user.name;
    document.getElementById('user-email-display').textContent = user.email;
    
    try {
        const createdDate = new Date(user.createdAt);
        const lastLoginDate = new Date(user.lastLogin);
        
        document.getElementById('user-created-display').textContent = createdDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        document.getElementById('user-login-display').textContent = lastLoginDate.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.error('Error formatting dates:', e);
        document.getElementById('user-created-display').textContent = user.createdAt;
        document.getElementById('user-login-display').textContent = user.lastLogin;
    }
    
    if (user.darkMode !== undefined) {
        const theme = user.darkMode ? 'dark' : 'light';
        console.log('🎨 Loading user theme preference:', theme);
        setTheme(theme);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        clearUserData();
        
        document.getElementById('user-profile').style.display = 'none';
        document.getElementById('settings-panel').style.display = 'none';
        document.getElementById('auth-container').style.display = 'flex';
        
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
        switchToLogin();
        
        showMessage('👋 You have been logged out successfully.', 'info');
    }
}

// ========================================
// SETTINGS
// ========================================

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
        console.log('⚙️ Settings panel opened');
    } else {
        panel.style.display = 'none';
        console.log('⚙️ Settings panel closed');
    }
}

function setTheme(theme) {
    const html = document.documentElement;
    
    console.log('🎨 Setting theme to:', theme);
    
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('amTheme', 'dark');
        setCookie('amTheme', 'dark', 365);
    } else {
        html.removeAttribute('data-theme');
        localStorage.setItem('amTheme', 'light');
        setCookie('amTheme', 'light', 365);
    }
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function loadTheme() {
    let savedTheme = localStorage.getItem('amTheme');
    
    if (!savedTheme) {
        savedTheme = getCookie('amTheme') || 'light';
    }
    
    console.log('🎨 Loading saved theme:', savedTheme);
    setTheme(savedTheme);
}

async function saveSettings() {
    const user = getUserData();
    
    if (!user) {
        alert('❌ You must be logged in to save settings.');
        return;
    }
    
    console.log('💾 Saving settings...');
    
    const saveBtn = document.getElementById('save-settings-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loading"></span> Saving...';
    
    try {
        const theme = localStorage.getItem('amTheme');
        const darkMode = theme === 'dark';
        
        console.log('📤 Sending settings update:', { email: user.email, darkMode });
        
        const result = await makeGoogleSheetsRequest('UPDATE_SETTINGS', {
            email: user.email,
            darkMode: darkMode
        });
        
        console.log('📥 Settings update result:', result);
        
        if (result.success) {
            // Update user object
            user.darkMode = darkMode;
            
            // Re-save to all storages with updated darkMode
            saveUserData(user);
            
            console.log('✅ Settings saved successfully!');
            alert('✅ Settings saved successfully!');
        } else {
            console.error('❌ Save failed:', result.message);
            alert('❌ Failed to save settings: ' + result.message);
        }
    } catch (error) {
        console.error('❌ Save settings error:', error);
        alert('⚠️ Error: ' + error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

console.log('✅ Auth.js loaded successfully!');
