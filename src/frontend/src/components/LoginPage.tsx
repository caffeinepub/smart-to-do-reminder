import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

interface LoginPageProps {
  onAuth: (username: string) => void;
}

export function LoginPage({ onAuth }: LoginPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");

  function validateUsername(value: string): string {
    if (!value) return "Username is required.";
    if (!/^[A-Z]/.test(value))
      return "Username must start with a capital letter.";
    return "";
  }

  function validatePassword(value: string): string {
    if (!value) return "Password is required.";
    if (!/^\d{4}$/.test(value))
      return "Password must be exactly 4 digits (numbers only).";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uErr = validateUsername(username);
    const pErr = validatePassword(password);
    setUsernameError(uErr);
    setPasswordError(pErr);
    setGlobalError("");
    if (uErr || pErr) return;

    if (mode === "login") {
      const ok = login(username, password);
      if (!ok) {
        setGlobalError("Invalid username or password.");
      } else {
        onAuth(username);
      }
    } else {
      const result = register(username, password);
      if (!result.ok) {
        if (result.error?.toLowerCase().includes("username")) {
          setUsernameError(result.error || "");
        } else {
          setPasswordError(result.error || "");
        }
      } else {
        onAuth(username);
      }
    }
  }

  function toggleMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setUsernameError("");
    setPasswordError("");
    setGlobalError("");
    setUsername("");
    setPassword("");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-card">
            <CheckCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Smart To-Do
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
          <h2 className="font-display font-bold text-lg text-foreground mb-5">
            {mode === "login" ? "Sign In" : "Register"}
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                data-ocid="login.username_input"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                  setGlobalError("");
                }}
                placeholder="Starts with capital letter"
                autoComplete="username"
                className={`rounded-xl ${usernameError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {usernameError && (
                <p
                  data-ocid="login.error_state"
                  className="text-xs text-destructive mt-1"
                >
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                data-ocid="login.password_input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                  setGlobalError("");
                }}
                placeholder="4-digit number (e.g. 1234)"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                maxLength={4}
                className={`rounded-xl ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {passwordError && (
                <p
                  data-ocid="login.error_state"
                  className="text-xs text-destructive mt-1"
                >
                  {passwordError}
                </p>
              )}
            </div>

            {/* Global error */}
            {globalError && (
              <p
                data-ocid="login.error_state"
                className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2"
              >
                {globalError}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              data-ocid="login.submit_button"
              className="w-full rounded-xl font-semibold"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            data-ocid="login.toggle_button"
            onClick={toggleMode}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>

        {/* Hints */}
        <div className="mt-5 bg-muted/50 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
          <p>• Username must start with a capital letter (e.g. Alice)</p>
          <p>• Password must be exactly 4 digits (e.g. 1234)</p>
        </div>
      </div>
    </div>
  );
}
