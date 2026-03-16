import { useEffect, useRef } from "react";
import type { Task } from "../backend.d";

export function useNotificationScheduler(tasks: Task[] | undefined) {
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (!tasks || Notification.permission !== "granted") return;

    const now = Date.now();

    for (const task of tasks) {
      if (task.completed) continue;
      if (!task.dueDate || !task.dueTime) continue;

      const dueMs = new Date(`${task.dueDate}T${task.dueTime}`).getTime();
      const delay = dueMs - now;

      if (delay > 0) {
        const timeout = setTimeout(() => {
          new Notification("Smart To-Do Reminder", {
            body: `Reminder: You have a task to complete. — ${task.title}`,
            icon: "/favicon.ico",
          });
        }, delay);
        timeoutsRef.current.push(timeout);
      }
    }

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [tasks]);
}
