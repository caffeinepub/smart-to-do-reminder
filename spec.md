# Smart To-Do Reminder

## Current State
The app is a task management dashboard with Today/Upcoming/Done tabs, task creation/editing, browser notifications, and dark mode. No authentication exists -- the dashboard is shown directly.

## Requested Changes (Diff)

### Add
- Login page shown before the dashboard
- Registration: new users can create an account on the login page
- Username validation: must start with a capital letter, must be unique (stored in localStorage)
- Password validation: must be exactly 4 digits (integers only)
- After successful login, redirect to dashboard
- Dashboard header shows "Hi, [username]" greeting
- Logout button to return to login page
- Auth state persisted in localStorage (stay logged in on refresh)

### Modify
- App.tsx: wrap dashboard with auth check; if not logged in, show LoginPage; if logged in, show dashboard with username greeting
- Dashboard header: add "Hi, [username]" title below or near the "My Tasks" heading

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/hooks/useAuth.ts` -- manages users list and current session in localStorage
2. Create `src/frontend/src/components/LoginPage.tsx` -- login + register form with validation
3. Update `App.tsx` -- check auth state, show LoginPage or dashboard, pass username to dashboard, add logout
4. Add "Hi, [username]" greeting to dashboard and a logout button in header
