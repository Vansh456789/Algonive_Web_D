// CollabTask - Team Task Management System
// A collaborative task management platform with authentication and team features

class CollabTaskApp {
    constructor() {
        this.currentUser = null;
        this.teams = [];
        this.tasks = [];
        this.teamMembers = [];
        this.currentFilter = 'all';
        this.currentSort = 'dueDate';
        this.currentMemberFilter = 'all';
        this.init();
    }

    init() {
        this.loadData();
        if (this.currentUser) {
            this.showAppScreen();
            this.initializeAppListeners();
            this.renderTeamInfo();
            this.renderTasks();
            this.updateStats();
            this.checkReminders();
            setInterval(() => this.checkReminders(), 60000);
        } else {
            this.showAuthScreen();
            this.initializeAuthListeners();
        }
    }

    initializeAuthListeners() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    }

    initializeAppListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.status;
                this.renderTasks();
            });
        });

        // Sort dropdown
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Member filter dropdown
        document.getElementById('filterBy').addEventListener('change', (e) => {
            this.currentMemberFilter = e.target.value;
            this.renderTasks();
        });

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Modal close on outside click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeTaskModal();
            }
        });

        document.getElementById('viewTaskModal').addEventListener('click', (e) => {
            if (e.target.id === 'viewTaskModal') {
                this.closeViewTaskModal();
            }
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Simple validation
        if (!email || !password) {
            this.showError('insertAllowedError');
            return;
        }

        // Demo account for testing
        if (email === 'demo@email.com' && password === 'password123') {
            this.loginUser({
                id: 1,
                name: 'John Doe',
                email: email,
                teamId: 1
            });
            return;
        }

        // Check against stored users
        const users = JSON.parse(localStorage.getItem('collabtask_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.loginUser({
                id: user.id,
                name: user.name,
                email: user.email,
                teamId: user.teamId
            });
        } else {
            this.showToast('Invalid email or password', 'error');
        }
    }

    handleSignup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const teamName = document.getElementById('signupTeam').value;

        if (!name || !email || !password || !teamName) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('collabtask_users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showToast('Email already registered', 'error');
            return;
        }

        // Create new team
        const teamId = Date.now();
        const teams = JSON.parse(localStorage.getItem('collabtask_teams') || '[]');
        teams.push({
            id: teamId,
            name: teamName,
            createdAt: new Date().toISOString()
        });

        // Create new user
        const userId = Date.now() + 1;
        users.push({
            id: userId,
            name: name,
            email: email,
            password: password,
            teamId: teamId
        });

        localStorage.setItem('collabtask_users', JSON.stringify(users));
        localStorage.setItem('collabtask_teams', JSON.stringify(teams));

        this.showToast('Account created successfully! Please login.', 'success');
        this.toggleAuthForm();
    }

    loginUser(user) {
        this.currentUser = user;

        // Load team data
        const teams = JSON.parse(localStorage.getItem('collabtask_teams') || '[]');
        const team = teams.find(t => t.id === user.teamId);

        const users = JSON.parse(localStorage.getItem('collabtask_users') || '[]');
        this.teamMembers = users.filter(u => u.teamId === user.teamId);

        const tasks = JSON.parse(localStorage.getItem(`collabtask_tasks_${user.teamId}`) || '[]');
        this.tasks = tasks;

        localStorage.setItem('collabtask_currentUser', JSON.stringify(user));

        this.showAppScreen();
        this.initializeAppListeners();
        this.renderTeamInfo();
        this.populateAssigneeDropdown();
        this.renderTasks();
        this.updateStats();
    }

    logout() {
        localStorage.removeItem('collabtask_currentUser');
        this.currentUser = null;
        this.showAuthScreen();
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
    }

    showAuthScreen() {
        document.getElementById('authScreen').style.display = 'block';
        document.getElementById('appScreen').style.display = 'none';
    }

    showAppScreen() {
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
    }

    renderTeamInfo() {
        document.getElementById('teamName').textContent = this.getTeamName();
        document.getElementById('currentUserName').textContent = this.currentUser.name;
        document.getElementById('memberCount').textContent = `${this.teamMembers.length} member${this.teamMembers.length !== 1 ? 's' : ''}`;

        // Render team members
        const membersList = document.getElementById('teamMembersList');
        membersList.innerHTML = this.teamMembers.map(member => `
            <div class="member-item">
                <span>${member.name}</span>
                ${member.id === this.currentUser.id ? '<span class="member-badge">You</span>' : ''}
            </div>
        `).join('');

        // Update assignee filter dropdown
        const filterBy = document.getElementById('filterBy');
        if (filterBy.children.length === 1) {
            this.teamMembers.forEach(member => {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = member.name;
                filterBy.appendChild(option);
            });
        }
    }

    getTeamName() {
        const teams = JSON.parse(localStorage.getItem('collabtask_teams') || '[]');
        const team = teams.find(t => t.id === this.currentUser.teamId);
        return team ? team.name : 'Team';
    }

    populateAssigneeDropdown() {
        const select = document.getElementById('taskAssignee');
        select.innerHTML = '';
        this.teamMembers.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.name;
            if (member.id === this.currentUser.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    openCreateTaskModal() {
        document.getElementById('modalTitle').textContent = 'Create New Task';
        document.getElementById('taskId').value = '';
        document.getElementById('taskForm').reset();
        document.getElementById('taskStatus').value = 'pending';
        document.getElementById('taskPriority').value = 'medium';
        document.getElementById('taskAssignee').value = this.currentUser.id;
        document.getElementById('taskModal').classList.add('show');
    }

    saveTask() {
        const taskId = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const assigneeId = parseInt(document.getElementById('taskAssignee').value);
        const dueDate = document.getElementById('taskDueDate').value;
        const status = document.getElementById('taskStatus').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title || !dueDate || !assigneeId) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (taskId) {
            // Update existing task
            const task = this.tasks.find(t => t.id === parseInt(taskId));
            if (task) {
                task.title = title;
                task.description = description;
                task.assigneeId = assigneeId;
                task.dueDate = dueDate;
                task.status = status;
                task.priority = priority;
            }
            this.showToast('Task updated successfully', 'success');
        } else {
            // Create new task
            const task = {
                id: Date.now(),
                title: title,
                description: description,
                assigneeId: assigneeId,
                dueDate: dueDate,
                status: status,
                priority: priority,
                createdBy: this.currentUser.id,
                createdAt: new Date().toISOString()
            };
            this.tasks.push(task);
            this.showToast('Task created successfully', 'success');
        }

        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeTaskModal();
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskAssignee').value = task.assigneeId;
        document.getElementById('taskDueDate').value = task.dueDate;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskPriority').value = task.priority;

        document.getElementById('taskModal').classList.add('show');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showToast('Task deleted', 'success');
        }
    }

    filterTasks() {
        let filtered = this.tasks;

        // Filter by status
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(task => task.status === this.currentFilter);
        }

        // Filter by assignee
        if (this.currentMemberFilter !== 'all') {
            filtered = filtered.filter(task => task.assigneeId === parseInt(this.currentMemberFilter));
        }

        return filtered;
    }

    sortTasks(tasks) {
        const sorted = [...tasks];

        if (this.currentSort === 'dueDate') {
            sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (this.currentSort === 'assignee') {
            sorted.sort((a, b) => {
                const nameA = this.getMemberName(a.assigneeId);
                const nameB = this.getMemberName(b.assigneeId);
                return nameA.localeCompare(nameB);
            });
        } else if (this.currentSort === 'createdDate') {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return sorted;
    }

    getMemberName(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        return member ? member.name : 'Unknown';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
            return 'Today';
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.filterTasks();
        const sortedTasks = this.sortTasks(filteredTasks);

        if (sortedTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">📝 No tasks to show</div>';
            return;
        }

        container.innerHTML = sortedTasks.map(task => this.createTaskElement(task)).join('');

        // Attach event listeners
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('click', () => {
                const taskId = parseInt(card.dataset.taskId);
                this.viewTask(taskId);
            });
        });
    }

    createTaskElement(task) {
        const memberName = this.getMemberName(task.assigneeId);
        const statusClass = `status-${task.status}`;
        const priorityClass = `priority-${task.priority}`;

        return `
            <div class="task-card" data-task-id="${task.id}">
                <div>
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <span class="task-priority ${priorityClass}">${task.priority}</span>
                    </div>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <div class="task-meta-item">
                            <span class="task-assignee">${memberName}</span>
                        </div>
                        <div class="task-meta-item">
                            📅 ${this.formatDate(task.dueDate)}
                        </div>
                        <div class="task-meta-item">
                            <span class="task-status ${statusClass}">${task.status.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn action-edit" onclick="app.editTask(${task.id}); event.stopPropagation();">Edit</button>
                    <button class="action-btn action-delete" onclick="app.deleteTask(${task.id}); event.stopPropagation();">Delete</button>
                </div>
            </div>
        `;
    }

    viewTask(taskId) {
        // Open view modal with task details
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const memberName = this.getMemberName(task.assigneeId);
        const creatorName = this.getMemberName(task.createdBy);

        const html = `
            <h2>${this.escapeHtml(task.title)}</h2>
            <div style="margin-bottom: 20px;">
                <p class="task-description">${this.escapeHtml(task.description)}</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                <div>
                    <p style="color: var(--text-gray); font-size: 0.875rem; margin-bottom: 4px;">Assigned To</p>
                    <p style="font-weight: 600;">${memberName}</p>
                </div>
                <div>
                    <p style="color: var(--text-gray); font-size: 0.875rem; margin-bottom: 4px;">Due Date</p>
                    <p style="font-weight: 600;">${new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                    <p style="color: var(--text-gray); font-size: 0.875rem; margin-bottom: 4px;">Status</p>
                    <p style="font-weight: 600; text-transform: capitalize;">${task.status.replace('_', ' ')}</p>
                </div>
                <div>
                    <p style="color: var(--text-gray); font-size: 0.875rem; margin-bottom: 4px;">Priority</p>
                    <p style="font-weight: 600; text-transform: capitalize;">${task.priority}</p>
                </div>
            </div>
            <div style="padding-top: 16px; border-top: 1px solid var(--border-color);">
                <p style="color: var(--text-gray); font-size: 0.75rem; margin-bottom: 8px;">Created by ${creatorName} on ${new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
        `;

        document.getElementById('taskDetails').innerHTML = html;
        document.getElementById('viewTaskModal').classList.add('show');
    }

    updateStats() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => t.status === 'pending').length;
        const inProgress = this.tasks.filter(t => t.status === 'in_progress').length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;

        document.getElementById('totalTasksStat').textContent = total;
        document.getElementById('pendingTasksStat').textContent = pending;
        document.getElementById('inProgressTasksStat').textContent = inProgress;
        document.getElementById('completedTasksStat').textContent = completed;
    }

    checkReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const myTasks = this.tasks.filter(t => t.assigneeId === this.currentUser.id && t.status !== 'completed');
        const dueSoon = myTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
            return daysUntilDue >= 0 && daysUntilDue <= 1;
        });

        if (dueSoon.length > 0 && !this.reminderShownToday) {
            this.showToast(`You have ${dueSoon.length} task${dueSoon.length !== 1 ? 's' : ''} due soon!`, 'warning');
            this.reminderShownToday = true;
        }
    }

    inviteMember() {
        const email = document.getElementById('inviteEmail').value;
        if (!email) {
            this.showToast('Enter an email address', 'error');
            return;
        }

        const users = JSON.parse(localStorage.getItem('collabtask_users') || '[]');
        const existingUser = users.find(u => u.email === email);

        if (existingUser && existingUser.teamId === this.currentUser.teamId) {
            this.showToast('User is already a member', 'error');
            return;
        }

        // In a real app, this would send an invitation
        this.showToast('Invitation sent to ' + email, 'success');
        document.getElementById('inviteEmail').value = '';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = type === 'error' ? 'var(--danger-color)' : type === 'warning' ? 'var(--warning-color)' : 'var(--success-color)';
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('show');
    }

    closeViewTaskModal() {
        document.getElementById('viewTaskModal').classList.remove('show');
    }

    saveTasks() {
        localStorage.setItem(`collabtask_tasks_${this.currentUser.teamId}`, JSON.stringify(this.tasks));
    }

    loadData() {
        const userStr = localStorage.getItem('collabtask_currentUser');
        if (userStr) {
            this.currentUser = JSON.parse(userStr);

            const users = JSON.parse(localStorage.getItem('collabtask_users') || '[]');
            this.teamMembers = users.filter(u => u.teamId === this.currentUser.teamId);

            const tasks = JSON.parse(localStorage.getItem(`collabtask_tasks_${this.currentUser.teamId}`) || '[]');
            this.tasks = tasks;
        }

        // Initialize with demo data if no users exist
        if (JSON.parse(localStorage.getItem('collabtask_users') || '[]').length === 0) {
            this.initializeDemoData();
        }
    }

    initializeDemoData() {
        const demoTeams = [{ id: 1, name: 'Demo Team', createdAt: new Date().toISOString() }];
        const demoUsers = [
            { id: 1, name: 'John Doe', email: 'demo@email.com', password: 'password123', teamId: 1 },
            { id: 2, name: 'Jane Smith', email: 'jane@email.com', password: 'password123', teamId: 1 },
            { id: 3, name: 'Bob Johnson', email: 'bob@email.com', password: 'password123', teamId: 1 }
        ];

        const demoTasks = [
            {
                id: 101,
                title: 'Design new landing page',
                description: 'Create mockups and design for the new landing page',
                assigneeId: 1,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'in_progress',
                priority: 'high',
                createdBy: 1,
                createdAt: new Date().toISOString()
            },
            {
                id: 102,
                title: 'Fix authentication bug',
                description: 'Users cannot reset password properly',
                assigneeId: 2,
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'pending',
                priority: 'high',
                createdBy: 1,
                createdAt: new Date().toISOString()
            },
            {
                id: 103,
                title: 'Update documentation',
                description: 'Update API documentation for v2.0',
                assigneeId: 3,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'pending',
                priority: 'medium',
                createdBy: 1,
                createdAt: new Date().toISOString()
            }
        ];

        localStorage.setItem('collabtask_teams', JSON.stringify(demoTeams));
        localStorage.setItem('collabtask_users', JSON.stringify(demoUsers));
        localStorage.setItem('collabtask_tasks_1', JSON.stringify(demoTasks));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions
function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    signupForm.style.display = signupForm.style.display === 'none' ? 'block' : 'none';
}

function logout() {
    app.logout();
}

function openCreateTaskModal() {
    app.openCreateTaskModal();
}

function closeTaskModal() {
    app.closeTaskModal();
}

function closeViewTaskModal() {
    app.closeViewTaskModal();
}

function inviteMember() {
    app.inviteMember();
}

// Initialize the application
const app = new CollabTaskApp();
