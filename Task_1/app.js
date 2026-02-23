// TaskFlow - Personal Task Manager Application
// A modern, intuitive task management system with local storage persistence

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSort = 'dueDate';
        this.init();
    }

    init() {
        this.loadTasks();
        this.attachEventListeners();
        this.renderTasks();
        this.checkReminders();
        // Check reminders every minute
        setInterval(() => this.checkReminders(), 60000);
    }

    attachEventListeners() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });

        // Sort dropdown
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Modal close button
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeEditModal();
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateTask();
        });

        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                this.closeEditModal();
            }
        });
    }

    addTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;

        if (!title || !dueDate) {
            alert('Please fill in all required fields');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            description,
            dueDate,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        // Reset form
        document.getElementById('taskForm').reset();
        document.getElementById('taskPriority').value = 'medium';

        // Show success feedback
        this.showFeedback('Task added successfully!');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showFeedback('Task deleted');
        }
    }

    toggleTaskComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editTaskPriority').value = task.priority;

        document.getElementById('editModal').classList.add('show');
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('show');
    }

    updateTask() {
        const taskId = parseInt(document.getElementById('editTaskId').value);
        const task = this.tasks.find(t => t.id === taskId);

        if (!task) return;

        task.title = document.getElementById('editTaskTitle').value;
        task.description = document.getElementById('editTaskDescription').value;
        task.dueDate = document.getElementById('editTaskDueDate').value;
        task.priority = document.getElementById('editTaskPriority').value;

        this.saveTasks();
        this.renderTasks();
        this.closeEditModal();
        this.showFeedback('Task updated successfully!');
    }

    filterTasks() {
        let filtered = this.tasks;

        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(task => task.completed);
        } else if (this.currentFilter === 'overdue') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filtered = filtered.filter(task => {
                const dueDate = new Date(task.dueDate);
                return dueDate < today && !task.completed;
            });
        }

        return filtered;
    }

    sortTasks(tasksToSort) {
        const tasks = [...tasksToSort];

        if (this.currentSort === 'dueDate') {
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (this.currentSort === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (this.currentSort === 'dateAdded') {
            tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return tasks;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dueDate = new Date(dateString);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (dueDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        }

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    isOverdue(dateString) {
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    isDueToday(dateString) {
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDateNormalized = new Date(dateString);
        dueDateNormalized.setHours(0, 0, 0, 0);
        return dueDateNormalized.getTime() === today.getTime();
    }

    getDaysUntilDue(dateString) {
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.filterTasks();
        const sortedTasks = this.sortTasks(filteredTasks);

        if (sortedTasks.length === 0) {
            container.innerHTML = '<div class="empty-state">✨ No tasks to show. Create one to get started!</div>';
            return;
        }

        container.innerHTML = sortedTasks.map(task => this.createTaskElement(task)).join('');

        // Attach event listeners to task elements
        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = parseInt(card.dataset.taskId);
            card.querySelector('.task-checkbox').addEventListener('change', () => {
                this.toggleTaskComplete(taskId);
            });
            card.querySelector('.action-btn.edit').addEventListener('click', () => {
                this.openEditModal(taskId);
            });
            card.querySelector('.action-btn.delete').addEventListener('click', () => {
                this.deleteTask(taskId);
            });
        });
    }

    createTaskElement(task) {
        const isOverdue = this.isOverdue(task.dueDate) && !task.completed;
        const isDueToday = this.isDueToday(task.dueDate);
        const daysUntilDue = this.getDaysUntilDue(task.dueDate);

        let dueDateClass = '';
        if (isOverdue) {
            dueDateClass = 'overdue';
        } else if (isDueToday) {
            dueDateClass = 'today';
        }

        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                        <div class="task-meta-item due-date ${dueDateClass}">
                            📅 ${this.formatDate(task.dueDate)}
                            ${daysUntilDue > 0 && daysUntilDue <= 3 && !task.completed ? ` (${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left)` : ''}
                            ${isOverdue ? ' - Overdue!' : ''}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit">Edit</button>
                    <button class="action-btn delete">Delete</button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const totalTasks = this.tasks.filter(t => !t.completed).length;
        const completedTasks = this.tasks.filter(t => t.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    checkReminders() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tasksDueSoon = this.tasks.filter(task => {
            if (task.completed) return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const daysUntilDue = (dueDate - today) / (1000 * 60 * 60 * 24);
            return daysUntilDue >= 0 && daysUntilDue <= 1;
        });

        if (tasksDueSoon.length > 0) {
            this.showReminder(tasksDueSoon);
        }
    }

    showReminder(tasks) {
        const notification = document.getElementById('reminderNotification');
        const title = document.getElementById('reminderTitle');
        const message = document.getElementById('reminderMessage');

        if (tasks.length === 1) {
            title.textContent = 'Task Due Soon!';
            message.textContent = `"${tasks[0].title}" is due ${this.formatDate(tasks[0].dueDate)}`;
        } else {
            title.textContent = 'Multiple Tasks Due!';
            message.textContent = `You have ${tasks.length} tasks due soon`;
        }

        notification.classList.remove('hidden');

        // Auto-hide after 8 seconds
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 8000);
    }

    showFeedback(message) {
        // You could enhance this with a toast notification
        console.log(message);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('taskflow_tasks');
        this.tasks = saved ? JSON.parse(saved) : [];
    }
}

// Global functions for modal management
function closeEditModal() {
    taskManager.closeEditModal();
}

function closeNotification() {
    document.getElementById('reminderNotification').classList.add('hidden');
}

// Initialize the application
const taskManager = new TaskManager();
