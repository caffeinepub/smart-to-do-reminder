import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  CheckCheck,
  Clock,
  LogOut,
  Moon,
  Plus,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Task } from "./backend.d";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { LoginPage } from "./components/LoginPage";
import { TaskCard } from "./components/TaskCard";
import { TaskModal } from "./components/TaskModal";
import { useAuth } from "./hooks/useAuth";
import { useNotificationScheduler } from "./hooks/useNotifications";
import {
  useCreateTask,
  useDeleteTask,
  useGetAllTasks,
  useUpdateTask,
} from "./hooks/useQueries";
import { useTheme } from "./hooks/useTheme";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] =
    useState<NotificationPermission>(
      "Notification" in window ? Notification.permission : "denied",
    );

  const { data: tasks, isLoading } = useGetAllTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  useNotificationScheduler(tasks, notifPermission);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        setNotifPermission(perm);
      });
    }
  }, []);

  // Show login page if not authenticated
  if (!currentUser) {
    return (
      <>
        <LoginPage onAuth={() => {}} />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  const today = getToday();
  const todayTasks = (tasks || []).filter(
    (t) => t.dueDate === today && !t.completed,
  );
  const upcomingTasks = (tasks || []).filter(
    (t) => t.dueDate > today && !t.completed,
  );
  const completedTasks = (tasks || []).filter((t) => t.completed);

  const handleSave = async (data: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    priority: string;
  }) => {
    try {
      if (editTask) {
        await updateTask.mutateAsync({
          id: editTask.id,
          ...data,
          completed: editTask.completed,
        });
        toast.success("Task updated!");
      } else {
        await createTask.mutateAsync({ id: generateId(), ...data });
        toast.success("Task added!");
      }
      setModalOpen(false);
      setEditTask(null);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        priority: task.priority,
        completed: !task.completed,
      });
    } catch {
      toast.error("Failed to update task.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTask.mutateAsync(deleteId);
      toast.success("Task deleted.");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete task.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditTask(null);
    setModalOpen(true);
  };

  const isSaving = createTask.isPending || updateTask.isPending;
  const isDeleting = deleteTask.isPending;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="mx-auto w-full max-w-[430px] min-h-screen flex flex-col relative">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center">
              <CheckCheck className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-sm text-foreground leading-tight">
              Smart To-Do
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-ocid="header.toggle"
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>
            <button
              type="button"
              data-ocid="header.logout_button"
              onClick={() => {
                logout();
                toast.success("Logged out.");
              }}
              className="p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-4 pt-4 pb-24">
          <div className="mb-5">
            <h2 className="font-display font-bold text-2xl text-foreground">
              My Tasks
            </h2>
            <p className="text-lg font-semibold text-primary">
              Hi, {currentUser}!
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="bg-card rounded-2xl p-3 border border-border shadow-xs text-center">
              <p className="text-2xl font-display font-bold text-primary">
                {todayTasks.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Today</p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border shadow-xs text-center">
              <p className="text-2xl font-display font-bold text-foreground">
                {upcomingTasks.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Upcoming
              </p>
            </div>
            <div className="bg-card rounded-2xl p-3 border border-border shadow-xs text-center">
              <p className="text-2xl font-display font-bold text-foreground">
                {completedTasks.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Done</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="today">
            <TabsList className="w-full rounded-2xl bg-muted p-1 mb-4 h-auto">
              <TabsTrigger
                data-ocid="nav.tab"
                value="today"
                className="flex-1 rounded-xl text-xs font-semibold py-2 data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:text-foreground transition-all"
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Today
                {todayTasks.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                    {todayTasks.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                data-ocid="nav.tab"
                value="upcoming"
                className="flex-1 rounded-xl text-xs font-semibold py-2 data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:text-foreground transition-all"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Upcoming
                {upcomingTasks.length > 0 && (
                  <span className="ml-1.5 bg-muted-foreground/30 text-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                    {upcomingTasks.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                data-ocid="nav.tab"
                value="completed"
                className="flex-1 rounded-xl text-xs font-semibold py-2 data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:text-foreground transition-all"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Done
                {completedTasks.length > 0 && (
                  <span className="ml-1.5 bg-muted-foreground/30 text-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                    {completedTasks.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {isLoading && (
              <div data-ocid="todo.loading_state" className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl border border-border p-4 animate-pulse"
                  >
                    <div className="flex gap-3">
                      <div className="w-4 h-4 rounded bg-muted mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (
              <>
                <TabsContent value="today" className="mt-0 space-y-3">
                  {todayTasks.length === 0 ? (
                    <EmptyState
                      message="No tasks for today!"
                      sub="Add a task to get started."
                      icon="🎉"
                    />
                  ) : (
                    todayTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteId(id)}
                        onToggleComplete={handleToggleComplete}
                        isUpdating={updateTask.isPending}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="mt-0 space-y-3">
                  {upcomingTasks.length === 0 ? (
                    <EmptyState
                      message="Nothing upcoming!"
                      sub="Schedule your future tasks."
                      icon="📅"
                    />
                  ) : (
                    upcomingTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteId(id)}
                        onToggleComplete={handleToggleComplete}
                        isUpdating={updateTask.isPending}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-0 space-y-3">
                  {completedTasks.length === 0 ? (
                    <EmptyState
                      message="No completed tasks yet!"
                      sub="Finish your first task to see it here."
                      icon="✅"
                    />
                  ) : (
                    completedTasks.map((task, i) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={i}
                        onEdit={handleEdit}
                        onDelete={(id) => setDeleteId(id)}
                        onToggleComplete={handleToggleComplete}
                        isUpdating={updateTask.isPending}
                      />
                    ))
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>

        {/* Floating Add Button */}
        <button
          type="button"
          data-ocid="todo.add_button"
          onClick={handleAddNew}
          className="fixed bottom-6 right-[calc(50%-215px+16px)] max-[430px]:right-4 z-40 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="Add task"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>

      <TaskModal
        open={modalOpen}
        editTask={editTask}
        onClose={() => {
          setModalOpen(false);
          setEditTask(null);
        }}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <DeleteConfirmModal
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isDeleting={isDeleting}
      />

      <Toaster position="top-center" richColors />
    </div>
  );
}

function EmptyState({
  message,
  sub,
  icon,
}: { message: string; sub: string; icon: string }) {
  return (
    <div
      data-ocid="todo.empty_state"
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-display font-semibold text-base text-foreground mb-1">
        {message}
      </p>
      <p className="text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}
