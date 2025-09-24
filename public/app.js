class PasswordManager {
    constructor() {
        this.passwords = [];
        this.filteredPasswords = [];
        this.selectedCategory = 'all';
        this.searchTerm = '';
        this.darkMode = true;
        this.categories = [];
        this.init();
    };

    async init() {
        this.initTheme();
        this.setupEventListeners();
        await this.loadPasswords();
        await this.loadCategories();
        this.renderCategories();
        this.renderPasswords();
        this.updateStats();
        this.showWelcomeScreen();
    };

    async loadCategories() {
        const customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');

        this.categories = [
            { id: 'other', name: 'Autre', icon: '📝' },
            ...customCategories,
        ];
    };

    renderCategories() {
        const container = document.getElementById('categories-list');
        if (!container) return;
        container.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn' + (this.selectedCategory === 'all' ? ' active' : '');
        allBtn.dataset.category = 'all';
        allBtn.textContent = '🗂️ Tous';
        allBtn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            this.selectedCategory = 'all';
            this.filterPasswords();
        });
        container.appendChild(allBtn);

        this.categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn' + (this.selectedCategory === cat.id ? ' active' : '');
            btn.dataset.category = cat.id;
            btn.innerHTML = `<span class="cat-icon">${cat.icon}</span> <span class="cat-name">${cat.name}</span>`;

            if (!['social', 'email', 'finance', 'work', 'entertainment', 'shopping', 'other'].includes(cat.id)) {
                const editBtn = document.createElement('span');
                editBtn.className = 'cat-edit-btn';
                editBtn.title = 'Modifier';
                editBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L10 17l-4 1 1-4 11.5-11.5z"></path></svg>`;
                editBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    this.showAddCategoryModal(cat);
                });
                const delBtn = document.createElement('span');
                delBtn.className = 'cat-del-btn';
                delBtn.title = 'Supprimer';
                delBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"></polyline><path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path></svg>`;
                delBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    this.showConfirmModal('Êtes-vous sûr de vouloir supprimer cette catégorie ?', () => {
                        this.deleteCategory(cat.id);
                    });
                });
                btn.appendChild(editBtn);
                btn.appendChild(delBtn);
            };

            btn.addEventListener('click', (e) => {
                if (e.target.closest('.cat-del-btn')) return;
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedCategory = cat.id;
                this.filterPasswords();
            });

            container.appendChild(btn);
        });
    };

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainApp = document.getElementById('main-app');

        welcomeScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    };

    setupEventListeners() {
        document.getElementById('continue-btn').addEventListener('click', () => {
            document.getElementById('welcome-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
        });

        document.getElementById('minimize-btn').addEventListener('click', () => {
            window.electronAPI.windowControls('minimize');
        });
        document.getElementById('maximize-btn').addEventListener('click', () => {
            window.electronAPI.windowControls('maximize');
        });
        document.getElementById('close-btn').addEventListener('click', () => {
            window.electronAPI.windowControls('close');
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.filterPasswords();
        });

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.selectedCategory = e.target.dataset.category;
                this.filterPasswords();
            });
        });

        document.getElementById('add-password-btn').addEventListener('click', () => {
            this.showPasswordModal();
        });

        document.getElementById('password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePassword();
        });

        document.getElementById('modal-close').addEventListener('click', () => {
            this.hidePasswordModal();
        });

        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hidePasswordModal();
            };
        });

        document.getElementById('generate-password').addEventListener('click', () => {
            this.generatePassword();
        });

        document.getElementById('password-input').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.showAddCategoryModal();
        });

        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.showAddCategoryModal();
        });

        document.getElementById('category-modal-close').addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('category-modal-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideCategoryModal();
            };
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
    };

    async loadPasswords() {
        try {
            const data = localStorage.getItem('passwords');
            this.passwords = data ? JSON.parse(data) : [];
            this.filterPasswords();
        } catch (error) {
            // this.showNotification('Erreur lors du chargement', 'error');
        };
    };

    async savePasswords() {
        try {
            localStorage.setItem('passwords', JSON.stringify(this.passwords));
        } catch (error) {
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        };
    };

    filterPasswords() {
        let filtered = this.passwords;

        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(pwd => pwd.category === this.selectedCategory);
        };

        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();
            filtered = filtered.filter(pwd =>
                pwd.service.toLowerCase().includes(search) ||
                pwd.username.toLowerCase().includes(search) ||
                pwd.description.toLowerCase().includes(search)
            );
        };

        this.filteredPasswords = filtered;
        this.renderPasswords();
    };

    renderPasswords() {
        const container = document.getElementById('passwords-grid');
        container.innerHTML = '';

        if (this.filteredPasswords.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                <div class="empty-icon">🔒</div>
                <h3>Aucun mot de passe</h3>
                <p>${this.searchTerm ? 'Aucun résultat pour votre recherche' : 'Commencez par ajouter votre premier mot de passe'}</p>
                </div>
            `;
            return;
        };

        this.filteredPasswords.forEach(pwd => {
            const card = this.createPasswordCard(pwd);
            container.appendChild(card);
        });
    };

    getCategoryName(catId) {
        const category = passwordManager.categories.find(c => c.id === catId);
        return category ? category.name : 'Autre';
    };

    createPasswordCard(pwd) {
        const card = document.createElement('div');
        card.className = 'password-card';

        const categoryIcon = this.getCategoryIcon(pwd.category);
        const strengthClass = this.getPasswordStrengthClass(pwd.password);

        card.innerHTML = `
            <div class="card-header">
                <div class="service-info">
                <div class="service-icon">${categoryIcon}</div>
                <div>
                    <h3>${this.escapeHtml(pwd.service)}</h3>
                    <p class="username">${this.escapeHtml(pwd.username || 'Aucun utilisateur')}</p>
                </div>
                </div>
                <div class="card-actions">
                <button class="action-btn" onclick="passwordManager.editPassword('${pwd.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="m18.5 2.5 3 3L10 17l-4 1 1-4 11.5-11.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete" onclick="passwordManager.deletePassword('${pwd.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    </svg>
                </button>
                </div>
            </div>
            
            <div class="card-body">
                ${pwd.description ? `<p class="description">${this.escapeHtml(pwd.description)}</p>` : ''}
                
                <div class="password-field">
                <div class="password-input-group">
                    <input type="password" value="${this.escapeHtml(pwd.password)}" readonly class="password-input" id="pwd-${pwd.id}">
                    <button class="input-btn toggle" onclick="passwordManager.togglePassword('${pwd.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    </button>
                    <button class="input-btn copy" onclick="passwordManager.copyPassword('${pwd.password}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    </button>
                </div>
                <div class="password-strength ${strengthClass}">
                    <div class="strength-indicator"></div>
                    <span class="strength-text">${this.getPasswordStrengthText(pwd.password)}</span>
                </div>
                </div>
            </div>
            
            <div class="card-footer">
                <span class="category-tag blue">${this.getCategoryName(pwd.category)}</span>
                <span class="date">Ajouté le ${new Date(pwd.createdAt).toLocaleDateString()}</span>
            </div>
        `;

        return card;
    };

    updateCategorySelect() {
        const select = document.getElementById('category-select');
        select.innerHTML = '';
        this.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });
    };

    showPasswordModal(password = null) {
        const modal = document.getElementById('password-modal');
        const form = document.getElementById('password-form');

        this.updateCategorySelect();

        if (password) {
            document.getElementById('modal-title').textContent = 'Modifier le mot de passe';
            document.getElementById('service-input').value = password.service;
            document.getElementById('username-input').value = password.username || '';
            document.getElementById('password-input').value = password.password;
            document.getElementById('description-input').value = password.description || '';
            document.getElementById('category-select').value = password.category;
            form.dataset.editId = password.id;
        } else {
            document.getElementById('modal-title').textContent = 'Ajouter un mot de passe';
            form.reset();
            delete form.dataset.editId;
        };

        modal.style.display = 'flex';
        document.getElementById('service-input').focus();
    };

    hidePasswordModal() {
        document.getElementById('password-modal').style.display = 'none';
        document.getElementById('password-form').reset();
        document.getElementById('password-strength').className = 'password-strength';
    };

    async savePassword() {
        const form = document.getElementById('password-form');
        const service = document.getElementById('service-input').value.trim();
        const username = document.getElementById('username-input').value.trim();
        const password = document.getElementById('password-input').value;
        const description = document.getElementById('description-input').value.trim();
        const category = document.getElementById('category-select').value;

        if (!service || !password) {
            this.showNotification('Le service et le mot de passe sont requis', 'error');
            return;
        };

        const passwordData = {
            id: form.dataset.editId || this.generateId(),
            service,
            username,
            password,
            description,
            category,
            createdAt: form.dataset.editId ?
                this.passwords.find(p => p.id === form.dataset.editId)?.createdAt :
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (form.dataset.editId) {
            const index = this.passwords.findIndex(p => p.id === form.dataset.editId);
            this.passwords[index] = passwordData;
            this.showNotification('Mot de passe mis à jour', 'success');
        } else {
            this.passwords.push(passwordData);
            this.showNotification('Mot de passe ajouté', 'success');
        };

        await this.savePasswords();
        this.filterPasswords();
        this.updateStats();
        this.hidePasswordModal();
    };

    editPassword(id) {
        const password = this.passwords.find(p => p.id === id);
        if (password) {
            this.showPasswordModal(password);
        };
    };

    async deletePassword(id) {
        this.showConfirmModal('Êtes-vous sûr de vouloir supprimer ce mot de passe ?', async () => {
            this.passwords = this.passwords.filter(p => p.id !== id);
            await this.savePasswords();
            this.filterPasswords();
            this.updateStats();
            this.showNotification('Mot de passe supprimé', 'success');
        });
    };

    togglePassword(id) {
        const input = document.getElementById(`pwd-${id}`);
        const button = input.nextElementSibling;

        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        } else {
            input.type = 'password';
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        };
    };

    copyPassword(password) {
        navigator.clipboard.writeText(password).then(() => {
            this.showNotification('Mot de passe copié', 'success');
        }).catch(() => {
            this.showNotification('Erreur lors de la copie', 'error');
        });
    };

    generatePassword() {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        };

        document.getElementById('password-input').value = password;
        this.checkPasswordStrength(password);
        this.showNotification('Mot de passe généré', 'success');
    };

    checkPasswordStrength(password) {
        const strengthElement = document.getElementById('password-strength');
        const strengthText = strengthElement.querySelector('.strength-text');

        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        strengthElement.className = 'password-strength';

        if (score < 3) {
            strengthElement.classList.add('weak');
            strengthText.textContent = 'Faible';
        } else if (score < 5) {
            strengthElement.classList.add('medium');
            strengthText.textContent = 'Moyen';
        } else {
            strengthElement.classList.add('strong');
            strengthText.textContent = 'Fort';
        };
    };

    getPasswordStrengthClass(password) {
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score < 3) return 'weak';
        if (score < 5) return 'medium';
        return 'strong';
    };

    getPasswordStrengthText(password) {
        const strengthClass = this.getPasswordStrengthClass(password);
        switch (strengthClass) {
            case 'weak': return 'Faible';
            case 'medium': return 'Moyen';
            case 'strong': return 'Fort';
            default: return '';
        };
    };

    showAddCategoryModal(category = null) {
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        if (category) {
            document.getElementById('category-modal-title').textContent = 'Modifier la catégorie';
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-emoji').value = category.icon;
            form.dataset.editId = category.id;
        } else {
            document.getElementById('category-modal-title').textContent = 'Ajouter une catégorie';
            form.reset();
            delete form.dataset.editId;
        };
        modal.style.display = 'flex';
        document.getElementById('category-name').focus();
    };

    hideCategoryModal() {
        document.getElementById('category-modal').style.display = 'none';
        document.getElementById('category-form').reset();
    };

    async saveCategory() {
        const form = document.getElementById('category-form');
        const name = document.getElementById('category-name').value.trim();
        let icon = document.getElementById('category-emoji').value.trim() || '📝';
        if (!name) {
            this.showNotification('Le nom de la catégorie est requis', 'error');
            return;
        };

        if (!icon.match(/\p{Emoji}/u)) {
            this.showNotification('Veuillez entrer un emoji pour l’icône', 'error');
            return;
        };

        let customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        if (form.dataset.editId) {
            const idx = customCategories.findIndex(c => c.id === form.dataset.editId);
            if (idx !== -1) {
                customCategories[idx].name = name;
                customCategories[idx].icon = icon;
                this.showNotification('Catégorie modifiée', 'success');
            };
        } else {
            const newCat = {
                id: this.generateId(),
                name,
                icon
            };
            customCategories.push(newCat);
            this.showNotification('Catégorie ajoutée', 'success');
        };
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
        await this.loadCategories();
        this.renderCategories();
        this.hideCategoryModal();
    };

    async deleteCategory(id) {
        let customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
        customCategories = customCategories.filter(c => c.id !== id);
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
        this.passwords.forEach(pwd => {
            if (pwd.category === id) pwd.category = 'other';
        });
        await this.savePasswords();
        await this.loadCategories();
        this.renderCategories();
        this.filterPasswords();
        this.updateStats();
        this.showNotification('Catégorie supprimée', 'success');
    };

    showConfirmModal(message, onConfirm) {
        let modal = document.createElement('div');
        modal.className = 'custom-confirm-modal';
        modal.innerHTML = `
            <div class="custom-confirm-overlay" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:9999;"></div>
            <div class="custom-confirm-content" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#222;padding:32px 24px;border-radius:16px;z-index:10000;min-width:260px;box-shadow:0 8px 32px rgba(0,0,0,0.25);color:#fff;text-align:center;">
                <p style="margin-bottom:24px;">${message}</p>
                <div class="custom-confirm-actions" style="display:flex;gap:16px;justify-content:center;">
                    <button class="btn btn-secondary" id="custom-confirm-cancel">Annuler</button>
                    <button class="btn btn-danger" id="custom-confirm-ok">Supprimer</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('custom-confirm-cancel').onclick = () => {
            modal.remove();
        };
        document.getElementById('custom-confirm-ok').onclick = () => {
            modal.remove();
            if (typeof onConfirm === 'function') onConfirm();
        };
    };

    getCategoryIcon(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.icon : '📝';
    };

    updateStats() {
        document.getElementById('total-passwords').textContent = this.passwords.length;

        const categories = [...new Set(this.passwords.map(p => p.category))].length;
        document.getElementById('categories-count').textContent = categories;
    };

    toggleTheme() {
        this.darkMode = !this.darkMode;
        document.body.classList.toggle('light-theme', !this.darkMode);
        this.updateThemeIcon();

        localStorage.setItem('darkMode', this.darkMode);
    };

    updateThemeIcon() {
        const icon = document.getElementById('theme-toggle').querySelector('svg');
        if (this.darkMode) {
            icon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
        } else {
            icon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `;
        };
    };

    initTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        this.darkMode = savedTheme !== null ? JSON.parse(savedTheme) : true;

        document.body.classList.toggle('light-theme', !this.darkMode);
        this.updateThemeIcon();
    };

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            };
        }, 3000);
    };
};

let passwordManager;
document.addEventListener('DOMContentLoaded', () => {
    passwordManager = new PasswordManager();
});