import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Task } from "../backend.d";

const FIRED_KEY = "notif_fired";

function getFiredSet(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markFired(taskId: string, dueMs: number) {
  const set = getFiredSet();
  set.add(`${taskId}:${dueMs}`);
  const arr = Array.from(set);
  localStorage.setItem(FIRED_KEY, JSON.stringify(arr.slice(-200)));
}

function hasFired(taskId: string, dueMs: number): boolean {
  return getFiredSet().has(`${taskId}:${dueMs}`);
}

function playNotificationSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Two-tone chime: high then low
    const tones = [
      { freq: 880, start: 0, duration: 0.15 },
      { freq: 660, start: 0.18, duration: 0.25 },
    ];

    for (const tone of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(tone.freq, ctx.currentTime + tone.start);

      gain.gain.setValueAtTime(0, ctx.currentTime + tone.start);
      gain.gain.linearRampToValueAtTime(
        0.35,
        ctx.currentTime + tone.start + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + tone.start + tone.duration,
      );

      osc.start(ctx.currentTime + tone.start);
      osc.stop(ctx.currentTime + tone.start + tone.duration);
    }

    // Close context after sounds finish
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // ignore if audio is not available
  }
}

function fireReminder(task: Task) {
  playNotificationSound();

  toast(`Reminder: ${task.title}`, {
    description: task.description || "Your task is due now!",
    duration: 12000,
  });

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("Smart To-Do Reminder", {
        body: task.title + (task.description ? ` — ${task.description}` : ""),
        icon: "/favicon.ico",
        tag: `task-${task.id}`,
        silent: false,
      });
    } catch {
      // ignore
    }
  }
}

export function useNotificationScheduler(
  tasks: Task[] | undefined,
  _permission: NotificationPermission,
) {
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    function checkDueTasks() {
      const currentTasks = tasksRef.current;
      if (!currentTasks) return;
      const now = Date.now();
      const windowMs = 90_000;

      for (const task of currentTasks) {
        if (task.completed) continue;
        if (!task.dueDate || !task.dueTime) continue;
        const timeStr =
          task.dueTime.length === 5 ? `${task.dueTime}:00` : task.dueTime;
        const dueMs = new Date(`${task.dueDate}T${timeStr}`).getTime();
        if (Number.isNaN(dueMs)) continue;
        if (
          dueMs <= now &&
          dueMs > now - windowMs &&
          !hasFired(task.id, dueMs)
        ) {
          markFired(task.id, dueMs);
          fireReminder(task);
        }
      }
    }

    checkDueTasks();
    const interval = setInterval(checkDueTasks, 30_000);
    return () => clearInterval(interval);
  }, []);
}
