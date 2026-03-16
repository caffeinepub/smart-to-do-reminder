import { useState } from "react";

interface UserRecord {
  username: string;
  password: string;
}

const USERS_KEY = "todo_users";
const CURRENT_USER_KEY = "todo_current_user";

function getUsers(): UserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<string | null>(() =>
    localStorage.getItem(CURRENT_USER_KEY),
  );

  function login(username: string, password: string): boolean {
    const users = getUsers();
    const found = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (found) {
      localStorage.setItem(CURRENT_USER_KEY, username);
      setCurrentUser(username);
      return true;
    }
    return false;
  }

  function register(
    username: string,
    password: string,
  ): { ok: boolean; error?: string } {
    if (!username || !/^[A-Z]/.test(username)) {
      return { ok: false, error: "Username must start with a capital letter." };
    }
    if (!/^\d{4}$/.test(password)) {
      return { ok: false, error: "Password must be exactly 4 digits (0–9)." };
    }
    const users = getUsers();
    if (users.find((u) => u.username === username)) {
      return { ok: false, error: "Username already taken. Choose another." };
    }
    users.push({ username, password });
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, username);
    setCurrentUser(username);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  }

  return { currentUser, login, register, logout };
}
