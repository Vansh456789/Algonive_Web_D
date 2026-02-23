# TaskFlow - Personal Task Manager

A modern, intuitive, and responsive task management application built with vanilla JavaScript, HTML, and CSS. TaskFlow helps you stay organized and productive by providing a clean interface for managing your daily tasks.

## Features

### Core Functionality
- ✅ **Add Tasks** - Create tasks with title, description, due date, and priority level
- ✏️ **Edit Tasks** - Update task details anytime
- 🗑️ **Delete Tasks** - Remove completed or unwanted tasks
- ✓ **Mark Complete/Incomplete** - Track task progress with one click
- 🔄 **Filter Tasks** - View tasks by status (All, Pending, Completed, Overdue)
- 📊 **Sort Tasks** - Organize by due date, priority, or creation date
- 💾 **Local Storage** - All tasks are automatically saved to your browser's storage
- 🔔 **Deadline Reminders** - Get notified about tasks due soon

### User Interface
- 🎨 **Clean & Modern Design** - Beautiful gradient backgrounds and smooth animations
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Smooth Interactions** - Animated transitions and intuitive controls
- 📈 **Live Statistics** - See total and completed task counts at a glance

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or server setup required!

### How to Use

1. **Open the Application**
   - Open `index.html` in your web browser

2. **Create a Task**
   - Fill in the "Task Title" (required)
   - Add a description (optional but recommended)
   - Select a due date (required)
   - Choose a priority level (Low, Medium, High)
   - Click "Add Task"

3. **Manage Tasks**
   - **Complete a Task**: Click the checkbox next to the task
   - **Edit a Task**: Click the "Edit" button to modify details
   - **Delete a Task**: Click "Delete" to remove the task
   - **Filter Tasks**: Use filter buttons to view specific task categories
   - **Sort Tasks**: Change the sort order using the dropdown menu

4. **Reminders**
   - Tasks due today or tomorrow will show as "Today" or with days remaining
   - Overdue tasks are highlighted in red
   - Automatic notifications appear for tasks due within 24 hours

## File Structure

```
Task_1/
├── index.html      # Main HTML file with app structure
├── style.css       # Complete styling and responsive design
├── app.js          # JavaScript application logic
└── README.md       # This file
```

## Technical Details

### Technologies Used
- **HTML5** - Semantic markup and form elements
- **CSS3** - Modern styling with CSS Grid, Flexbox, and animations
- **JavaScript (ES6+)** - Modern JavaScript with classes and arrow functions
- **localStorage** - Browser API for persistent data storage

### Key Features Implementation

#### Task Management
- Uses a `TaskManager` class to handle all task operations
- Tasks stored as objects with unique IDs (timestamps)
- Complete CRUD operations (Create, Read, Update, Delete)

#### Local Storage
- Tasks automatically saved to browser localStorage
- Data persists across browser sessions
- `saveTasks()` and `loadTasks()` methods handle persistence

#### Filtering & Sorting
- **Filter Options**: All, Pending (incomplete), Completed, Overdue
- **Sort Options**: Due Date, Priority, Recently Added
- Combined filtering and sorting for flexible views

#### Reminders
- Automatic deadline checking every minute
- Tasks due within 24 hours trigger a notification
- Different styling for today's tasks and overdue tasks

### Data Structure

Each task object contains:
```javascript
{
    id: 1234567890,              // Unique timestamp ID
    title: "Task Title",         // Task name (required)
    description: "Details...",   // Task details (optional)
    dueDate: "2026-02-25",      // Date in YYYY-MM-DD format
    priority: "high",            // low, medium, or high
    completed: false,            // Completion status
    createdAt: "ISO-8601"       // Creation timestamp
}
```

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Tips & Tricks

1. **Set Realistic Priorities** - Use High priority for urgent tasks, Low for long-term goals
2. **Use Descriptions** - Add context to tasks for better recall later
3. **Check Reminders** - Look for notification toasts at the bottom right
4. **Stay Organized** - Use filters to focus on specific task categories
5. **Regular Cleanup** - Delete completed tasks to keep your list fresh

## Troubleshooting

**Q: My tasks disappeared!**
- A: Make sure your browser's localStorage is not disabled
- Check browser settings: Settings → Privacy & Security → Cookies and site data

**Q: Reminders not showing?**
- A: Ensure browser notifications are not muted
- Check if localStorage is enabled

**Q: Can I export my tasks?**
- A: Currently not supported, but you can take screenshots of your tasks
- Tasks are stored in localStorage and accessible to the app

## Future Enhancements

- 📤 Export/Import functionality (CSV, JSON)
- 🔐 Cloud sync and backup
- 👥 Shared tasks with other users
- 🎵 Custom notifications and sounds
- 🌙 Dark mode theme
- 📱 Progressive Web App (PWA) support

## Performance

- ⚡ Loads instantly - No server required
- 🎯 Fast filtering and sorting
- 💾 Efficient localStorage usage
- 🔄 Automatic data synchronization

## License

This project is created for educational purposes. Feel free to use and modify as needed.

## Support

For issues or feature requests, please consider:
1. Checking the FAQ section above
2. Clearing your browser cache and refreshing
3. Using a different browser to isolate issues

---

**Made with ❤️ for productivity lovers**
