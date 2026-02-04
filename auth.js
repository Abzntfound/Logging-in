// A&M Hair and Beauty - Authentication System (CSP-COMPLIANT VERSION)
// auth.js

// YOUR GOOGLE SHEETS WEB APP URL (Replace this after deploying Google Apps Script)
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx527wq0vGwyr2mQ7mGy7LGGny7IamcZB6EOzA2aLeXG_3LW2vBoBXIF3fWX6x-z0QOTA/exec';

// ========================================
// INITIALIZATION
// ========================================

// Check if user is already logged in when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Auth system loading...');
    
    // Setup all event listeners
    setupEventListeners();
    
    // Check login status
    checkLoginStatus();
    
    // Load theme
    loadTheme();
});

// Setup all event listeners (CSP-compliant)
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

// Check login status from localStorage
function checkLoginStatus() {
    const userData = localStorage.getItem('amUserData');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            console.log('✅ User already logged in:', user.email);
            showUserProfile(user);
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('amUserData');
        }
    } else {
        console.log('ℹ️ No user logged in');
    }
}

// ========================================
// FORM SWITCHING
// ========================================

// Switch to signup form
function switchToSignup() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'flex';
    document.getElementById('auth-title').textContent = 'Create Account';
    document.getElementById('auth-subtitle').textContent = 'Join the A&M family today!';
    hideMessage();
}

// Switch to login form
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

// Show message
function showMessage(text, type) {
    const messageEl = document.getElementById('auth-message');
    messageEl.textContent = text;
    messageEl.className = type;
    messageEl.style.display = 'block';
    console.log('📢 Message:', text, '| Type:', type);
}

// Hide message
function hideMessage() {
    const messageEl = document.getElementById('auth-message');
    messageEl.style.display = 'none';
}

// ========================================
// API COMMUNICATION
// ========================================

// Make API call to Google Sheets
async function makeGoogleSheetsRequest(action, data) {
    console.log('📤 Making request:', action, data);
    
    // Check if URL is configured
    if (GOOGLE_SHEETS_URL === 'YOUR_WEB_APP_URL_HERE') {
        throw new Error('⚠️ Please configure GOOGLE_SHEETS_URL in auth.js!\n\nFind line 5 and replace YOUR_WEB_APP_URL_HERE with your actual Web App URL from Google Apps Script.');
    }
    
    try {
        // Build URL with parameters for GET request
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

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    console.log('🔐 Login attempt for:', email);
    
    // Disable button and show loading
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
            showMessage('✅ Login successful! Welcome back!', 'success');
            
            // Save user data to localStorage
            localStorage.setItem('amUserData', JSON.stringify(result.user));
            console.log('💾 User data saved to localStorage');
            
            // Wait a moment then show profile
            setTimeout(() => {
                showUserProfile(result.user);
            }, 1000);
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

// Signup form handler
document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validate
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
    
    // Disable button and show loading
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
            
            // Clear form
            e.target.reset();
            
            // Switch to login after 2 seconds
            setTimeout(() => {
                switchToLogin();
                // Pre-fill email
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

// Show user profile
function showUserProfile(user) {
    console.log('👤 Showing profile for:', user.name);
    
    // Hide auth container
    document.getElementById('auth-container').style.display = 'none';
    
    // Show profile
    document.getElementById('user-profile').style.display = 'block';
    
    // Populate user data
    document.getElementById('user-name-display').textContent = user.name;
    document.getElementById('user-email-display').textContent = user.email;
    
    // Format dates
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
    
    // Load user theme preference
    if (user.darkMode !== undefined) {
        const theme = user.darkMode ? 'dark' : 'light';
        console.log('🎨 Loading user theme preference:', theme);
        setTheme(theme);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 Logging out...');
        localStorage.removeItem('amUserData');
        
        // Hide profile
        document.getElementById('user-profile').style.display = 'none';
        document.getElementById('settings-panel').style.display = 'none';
        
        // Show auth container
        document.getElementById('auth-container').style.display = 'flex';
        
        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('signup-form').reset();
        switchToLogin();
        
        showMessage('👋 You have been logged out successfully.', 'info');
    }
}

// ========================================
// SETTINGS
// ========================================

// Toggle settings panel
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

// Set theme
function setTheme(theme) {
    const html = document.documentElement;
    
    console.log('🎨 Setting theme to:', theme);
    
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('amTheme', 'dark');
    } else {
        html.removeAttribute('data-theme');
        localStorage.setItem('amTheme', 'light');
    }
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Load theme from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem('amTheme') || 'light';
    console.log('🎨 Loading saved theme:', savedTheme);
    setTheme(savedTheme);
}

// Save settings
async function saveSettings() {
    const userData = localStorage.getItem('amUserData');
    
    if (!userData) {
        alert('❌ You must be logged in to save settings.');
        return;
    }
    
    console.log('💾 Saving settings...');
    
    // Get the save button
    const saveBtn = document.getElementById('save-settings-btn');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loading"></span> Saving...';
    
    try {
        const user = JSON.parse(userData);
        const theme = localStorage.getItem('amTheme');
        const darkMode = theme === 'dark';
        
        console.log('📤 Sending settings update:', { email: user.email, darkMode });
        
        const result = await makeGoogleSheetsRequest('UPDATE_SETTINGS', {
            email: user.email,
            darkMode: darkMode
        });
        
        console.log('📥 Settings update result:', result);
        
        if (result.success) {
            // Update local storage with new user data
            user.darkMode = darkMode;
            localStorage.setItem('amUserData', JSON.stringify(user));
            
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
