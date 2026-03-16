# Smart To-Do Reminder

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- Full task management web app optimized for mobile screens
- Task creation form: title, description, date, time, priority level
- Task storage via Motoko backend (persistent across sessions)
- Dashboard with three tabs: Today, Upcoming, Completed
- Task cards showing title, scheduled time, status, priority badge, delete icon
- Mark task as complete, edit task, delete task actions
- Browser Notification API for reminder alerts ("Reminder: You have a task to complete.")
- Notification scheduler using setTimeout/setInterval based on task due datetime
- Dark mode toggle
- Add Task modal/sheet with all required fields
- Edit Task modal pre-filled with existing task data
- Daily summary notification at a configurable time

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Task data model (id, title, description, dueDate, dueTime, priority, completed, createdAt), CRUD operations
2. Frontend: Dashboard page with Today/Upcoming/Completed tabs
3. Frontend: Add/Edit Task modal with title, description, date picker, time picker, priority selector
4. Frontend: Task card component with status, actions
5. Frontend: Notification scheduler that fires browser notifications at task due times
6. Frontend: Dark mode support via Tailwind dark class
7. Frontend: Request notification permission on first load
