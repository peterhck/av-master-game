// Authentication Manager Module
// Handles user authentication, registration, and session management

import { config } from '../config.js';

export class AuthManager {
    constructor() {
        this.backendUrl = config.BACKEND_URL; // Backend API URL
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.isAuthenticated = false;
        this.pendingGameAction = null; // Store pending game action after login
        this.sessionCheckInterval = null; // For periodic session validation
        this.requireAuthForGame = true; // Whether game requires authentication
        this.authCheckInProgress = false; // Prevent multiple simultaneous auth checks

        this.init();
    }

    init() {
        // Check if we have a valid token on startup
        if (this.token) {
            this.validateToken();
        }

        this.setupEventListeners();
        this.startSessionMonitoring();
        console.log('🔐 Auth Manager initialized');
    }




    setupEventListeners() {
        // Auth modal triggers (game header)
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const profileBtn = document.getElementById('profile-btn');

        // Auth modal triggers (main menu)
        const menuLoginBtn = document.getElementById('menu-login-btn');
        const menuRegisterBtn = document.getElementById('menu-register-btn');
        const menuLogoutBtn = document.getElementById('menu-logout-btn');
        const menuProfileBtn = document.getElementById('menu-profile-btn');

        // Game header buttons
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfileModal());
        }

        // Main menu buttons
        if (menuLoginBtn) {
            menuLoginBtn.addEventListener('click', () => this.showLoginModal());
        }

        if (menuRegisterBtn) {
            menuRegisterBtn.addEventListener('click', () => this.showRegisterModal());
        }

        if (menuLogoutBtn) {
            menuLogoutBtn.addEventListener('click', () => this.logout());
        }

        if (menuProfileBtn) {
            menuProfileBtn.addEventListener('click', () => this.showProfileModal());
        }

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });
    }

    async validateToken() {
        if (this.authCheckInProgress) {
            console.log('🔐 Auth check already in progress, skipping...');
            return;
        }

        this.authCheckInProgress = true;
        
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.isAuthenticated = true;
                this.updateUI();
                console.log('✅ Token validated, user authenticated');
            } else {
                this.clearAuth();
                console.log('❌ Token invalid, cleared auth');
            }
        } catch (error) {
            console.error('Token validation error:', error);
            this.clearAuth();
        } finally {
            this.authCheckInProgress = false;
        }
    }

    /**
     * Check if user is authenticated and show login if not
     * @param {string} action - The action that requires authentication
     * @param {boolean} showLoginPrompt - Whether to show login prompt if not authenticated
     * @returns {boolean} - Whether user is authenticated
     */
    checkAuthentication(action = null, showLoginPrompt = true) {
        if (this.isAuthenticated && this.currentUser) {
            console.log('✅ User is authenticated:', this.currentUser.email);
            return true;
        }

        console.log('❌ User is not authenticated');
        
        if (action) {
            this.setPendingGameAction(action);
        }

        if (showLoginPrompt) {
            this.showAuthenticationRequired(action);
        }

        return false;
    }

    /**
     * Show authentication required modal
     */
    showAuthenticationRequired(action = null) {
        console.log('🔐 Showing authentication required for action:', action);
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('auth-required-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'auth-required-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const actionText = action ? ` to ${action.replace('-', ' ')}` : '';
        
        modal.innerHTML = `
            <div class="auth-required-content">
                <div class="auth-required-header">
                    <i class="fas fa-lock" style="color: #ff4757; font-size: 2rem;"></i>
                    <h2>Authentication Required</h2>
                </div>
                <div class="auth-required-body">
                    <p>You need to log in or create an account${actionText}.</p>
                    <p>This helps us save your progress and provide personalized learning experiences.</p>
                </div>
                <div class="auth-required-actions">
                    <button id="auth-login-btn" class="auth-btn primary">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </button>
                    <button id="auth-register-btn" class="auth-btn secondary">
                        <i class="fas fa-user-plus"></i>
                        Create Account
                    </button>
                    <button id="auth-cancel-btn" class="auth-btn cancel">
                        <i class="fas fa-times"></i>
                        Cancel
                    </button>
                </div>
            </div>
        `;

        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        // Add to page
        document.body.appendChild(modal);

        // Add event listeners
        const loginBtn = modal.querySelector('#auth-login-btn');
        const registerBtn = modal.querySelector('#auth-register-btn');
        const cancelBtn = modal.querySelector('#auth-cancel-btn');

        loginBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showLoginModal();
        });

        registerBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showRegisterModal();
        });

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * Start periodic session monitoring
     */
    startSessionMonitoring() {
        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(() => {
            if (this.isAuthenticated && this.token) {
                this.validateToken();
            }
        }, 5 * 60 * 1000); // 5 minutes

        console.log('🔐 Session monitoring started');
    }

    /**
     * Stop session monitoring
     */
    stopSessionMonitoring() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
            console.log('🔐 Session monitoring stopped');
        }
    }

    async register(userData) {
        try {
            console.log('🔍 Frontend sending registration data:', userData);
            console.log('🔍 Backend URL:', this.backendUrl);
            console.log('🔍 Request body:', JSON.stringify(userData));

            const response = await fetch(`${this.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            console.log('🔍 Response status:', response.status);
            console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

            const data = await response.json();
            console.log('🔍 Response data:', data);

            if (response.ok) {
                this.setAuth(data.token, data.user);
                this.closeAllModals();
                this.showNotification('Registration successful!', 'success');
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('🔍 Registration error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            this.showNotification(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async login(credentials) {
        try {
            console.log('🔍 Frontend sending login data:', credentials);
            console.log('🔍 Backend URL:', this.backendUrl);

            const response = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (response.ok) {
                this.setAuth(data.token, data.user);
                this.closeAllModals();
                this.showNotification('Login successful!', 'success');

                // Execute pending game action if any
                setTimeout(() => {
                    this.executePendingGameAction();
                }, 500); // Small delay to ensure UI is updated

                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.backendUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuth();
            this.showNotification('Logged out successfully', 'info');
        }
    }

    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.updateUI();
                this.closeAllModals();
                this.showNotification('Profile updated successfully!', 'success');
                return { success: true, user: data.user };
            } else {
                throw new Error(data.error || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            this.showNotification(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async changePassword(passwordData) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();

            if (response.ok) {
                this.closeAllModals();
                this.showNotification('Password changed successfully!', 'success');
                return { success: true };
            } else {
                throw new Error(data.error || 'Password change failed');
            }
        } catch (error) {
            console.error('Password change error:', error);
            this.showNotification(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    setAuth(token, user) {
        this.token = token;
        this.currentUser = user;
        this.isAuthenticated = true;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));

        this.updateUI();
        this.startSessionMonitoring();
        console.log('🔐 User authenticated:', user.email);
    }

    clearAuth() {
        this.token = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.pendingGameAction = null; // Clear pending action on logout

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        this.updateUI();
        this.stopSessionMonitoring();
        console.log('🔐 Auth cleared');
    }

    setPendingGameAction(action) {
        this.pendingGameAction = action;
        console.log('🎮 Pending game action set:', action);
    }

    executePendingGameAction() {
        if (this.pendingGameAction && window.game) {
            console.log('🎮 Executing pending game action:', this.pendingGameAction);

            switch (this.pendingGameAction) {
                case 'start-game':
                    window.game.showLevelSelect();
                    break;
                case 'tutorial':
                    window.game.showTutorial();
                    break;
                case 'settings':
                    window.game.showSettings();
                    break;
                case 'continue-game':
                    window.game.continueGame();
                    break;
                case 'level-select':
                    window.game.showLevelSelect();
                    break;
                default:
                    console.log('🎮 Unknown pending action:', this.pendingGameAction);
            }

            this.pendingGameAction = null; // Clear after execution
        }
    }

    /**
     * Require authentication for a specific game action
     * @param {string} action - The action name
     * @param {Function} callback - Function to call if authenticated
     * @param {boolean} showLoginPrompt - Whether to show login prompt
     */
    requireAuthForAction(action, callback, showLoginPrompt = true) {
        if (this.checkAuthentication(action, showLoginPrompt)) {
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    }

    /**
     * Get current authentication status
     * @returns {Object} - Authentication status object
     */
    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated,
            currentUser: this.currentUser,
            hasToken: !!this.token,
            requireAuth: this.requireAuthForGame
        };
    }

    updateUI() {
        // Game header elements
        const authContainer = document.getElementById('auth-container');
        const userContainer = document.getElementById('user-container');
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const profileBtn = document.getElementById('profile-btn');
        const userNameDisplay = document.getElementById('user-name');

        // Main menu elements
        const menuAuthContainer = document.getElementById('menu-auth-container');
        const menuUserContainer = document.getElementById('menu-user-container');
        const menuLoginBtn = document.getElementById('menu-login-btn');
        const menuRegisterBtn = document.getElementById('menu-register-btn');
        const menuLogoutBtn = document.getElementById('menu-logout-btn');
        const menuProfileBtn = document.getElementById('menu-profile-btn');
        const menuUserNameDisplay = document.getElementById('menu-user-name');

        if (this.isAuthenticated && this.currentUser) {
            // Show authenticated UI - Game Header
            if (authContainer) authContainer.style.display = 'none';
            if (userContainer) userContainer.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (profileBtn) profileBtn.style.display = 'block';

            if (userNameDisplay) {
                userNameDisplay.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }

            // Show authenticated UI - Main Menu
            if (menuAuthContainer) menuAuthContainer.style.display = 'none';
            if (menuUserContainer) menuUserContainer.style.display = 'flex';
            if (menuLoginBtn) menuLoginBtn.style.display = 'none';
            if (menuRegisterBtn) menuRegisterBtn.style.display = 'none';
            if (menuLogoutBtn) menuLogoutBtn.style.display = 'block';
            if (menuProfileBtn) menuProfileBtn.style.display = 'block';

            if (menuUserNameDisplay) {
                menuUserNameDisplay.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            }
        } else {
            // Show unauthenticated UI - Game Header
            if (authContainer) authContainer.style.display = 'flex';
            if (userContainer) userContainer.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'block';
            if (registerBtn) registerBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'none';

            // Show unauthenticated UI - Main Menu
            if (menuAuthContainer) menuAuthContainer.style.display = 'flex';
            if (menuUserContainer) menuUserContainer.style.display = 'none';
            if (menuLoginBtn) menuLoginBtn.style.display = 'block';
            if (menuRegisterBtn) menuRegisterBtn.style.display = 'block';
            if (menuLogoutBtn) menuLogoutBtn.style.display = 'none';
            if (menuProfileBtn) menuProfileBtn.style.display = 'none';
        }
    }

    showLoginModal() {
        this.closeAllModals();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-sign-in-alt"></i> Login</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="login-form" class="auth-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" name="password" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-sign-in-alt"></i> Login
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="window.authManager.showRegisterModal()">
                                <i class="fas fa-user-plus"></i> Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const form = modal.querySelector('#login-form');

        closeBtn.addEventListener('click', () => this.closeAllModals());

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            const result = await this.login(credentials);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (result.success) {
                this.closeAllModals();
            }
        });
    }

    showRegisterModal() {
        this.closeAllModals();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Register</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="register-form" class="auth-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="register-firstName">First Name</label>
                                <input type="text" id="register-firstName" name="firstName" required>
                            </div>
                            <div class="form-group">
                                <label for="register-lastName">Last Name</label>
                                <input type="text" id="register-lastName" name="lastName" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="register-password">Password</label>
                            <input type="password" id="register-password" name="password" required minlength="8">
                            <small>Must be at least 8 characters</small>
                        </div>
                        <div class="form-group">
                            <label for="register-organization">Organization (Optional)</label>
                            <input type="text" id="register-organization" name="organization">
                        </div>
                        <div class="form-group">
                            <label for="register-role">Role</label>
                            <select id="register-role" name="role">
                                <option value="student">Student</option>
                                <option value="instructor">Instructor</option>
                                <option value="user">General User</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-user-plus"></i> Register
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="window.authManager.showLoginModal()">
                                <i class="fas fa-sign-in-alt"></i> Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const form = modal.querySelector('#register-form');

        closeBtn.addEventListener('click', () => this.closeAllModals());

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            console.log('🔍 Form submission started');

            const formData = new FormData(form);
            console.log('🔍 FormData entries:', Array.from(formData.entries()));

            const userData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                organization: formData.get('organization') || null,
                role: formData.get('role')
            };

            console.log('🔍 Processed userData:', userData);

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
            submitBtn.disabled = true;

            const result = await this.register(userData);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (result.success) {
                this.closeAllModals();
            }
        });
    }

    showProfileModal() {
        this.closeAllModals();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user"></i> Profile</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-tab="profile">Profile</button>
                        <button class="tab-btn" data-tab="password">Password</button>
                    </div>
                    
                    <div class="tab-content" id="profile-tab">
                        <form id="profile-form" class="auth-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profile-firstName">First Name</label>
                                    <input type="text" id="profile-firstName" name="firstName" value="${this.currentUser.firstName}" required>
                                </div>
                                <div class="form-group">
                                    <label for="profile-lastName">Last Name</label>
                                    <input type="text" id="profile-lastName" name="lastName" value="${this.currentUser.lastName}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profile-email">Email</label>
                                <input type="email" id="profile-email" value="${this.currentUser.email}" disabled>
                                <small>Email cannot be changed</small>
                            </div>
                            <div class="form-group">
                                <label for="profile-organization">Organization</label>
                                <input type="text" id="profile-organization" name="organization" value="${this.currentUser.organization || ''}">
                            </div>
                            <div class="form-group">
                                <label for="profile-role">Role</label>
                                <select id="profile-role" name="role">
                                    <option value="student" ${this.currentUser.role === 'student' ? 'selected' : ''}>Student</option>
                                    <option value="instructor" ${this.currentUser.role === 'instructor' ? 'selected' : ''}>Instructor</option>
                                    <option value="user" ${this.currentUser.role === 'user' ? 'selected' : ''}>General User</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="tab-content" id="password-tab" style="display: none;">
                        <form id="password-form" class="auth-form">
                            <div class="form-group">
                                <label for="current-password">Current Password</label>
                                <input type="password" id="current-password" name="currentPassword" required>
                            </div>
                            <div class="form-group">
                                <label for="new-password">New Password</label>
                                <input type="password" id="new-password" name="newPassword" required minlength="8">
                                <small>Must be at least 8 characters</small>
                            </div>
                            <div class="form-group">
                                <label for="confirm-password">Confirm New Password</label>
                                <input type="password" id="confirm-password" name="confirmPassword" required minlength="8">
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-key"></i> Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const profileForm = modal.querySelector('#profile-form');
        const passwordForm = modal.querySelector('#password-form');

        closeBtn.addEventListener('click', () => this.closeAllModals());

        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tabContents = modal.querySelectorAll('.tab-content');
                tabContents.forEach(content => content.style.display = 'none');

                const targetTab = modal.querySelector(`#${btn.dataset.tab}-tab`);
                if (targetTab) targetTab.style.display = 'block';
            });
        });

        // Profile form submission
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(profileForm);
            const profileData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                organization: formData.get('organization') || null,
                role: formData.get('role')
            };

            const submitBtn = profileForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;

            const result = await this.updateProfile(profileData);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (result.success) {
                this.closeAllModals();
            }
        });

        // Password form submission
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(passwordForm);
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');

            if (newPassword !== confirmPassword) {
                this.showNotification('New passwords do not match', 'error');
                return;
            }

            const passwordData = {
                currentPassword: formData.get('currentPassword'),
                newPassword: newPassword
            };

            const submitBtn = passwordForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
            submitBtn.disabled = true;

            const result = await this.changePassword(passwordData);

            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            if (result.success) {
                passwordForm.reset();
            }
        });
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => modal.remove());
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Manual close
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated && this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get user token
    getToken() {
        return this.token;
    }
}
