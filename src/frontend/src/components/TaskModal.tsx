import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Task } from "../backend.d";

interface TaskModalProps {
  open: boolean;
  editTask: Task | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    priority: string;
  }) => void;
  isSaving: boolean;
}

const today = new Date().toISOString().split("T")[0];

export function TaskModal({
  open,
  editTask,
  onClose,
  onSave,
  isSaving,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [dueTime, setDueTime] = useState("09:00");
  const [priority, setPriority] = useState("medium");
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description);
        setDueDate(editTask.dueDate || today);
        setDueTime(editTask.dueTime || "09:00");
        setPriority(editTask.priority || "medium");
      } else {
        setTitle("");
        setDescription("");
        setDueDate(today);
        setDueTime("09:00");
        setPriority("medium");
      }
      setTitleError("");
    }
  }, [open, editTask]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }
    onSave({ title: title.trim(), description, dueDate, dueTime, priority });
  };

  const handleBackdropKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyUp={handleBackdropKey}
        aria-label="Close modal"
      />
      <div
        data-ocid="todo.dialog"
        className="relative w-full max-w-[430px] bg-card rounded-t-3xl shadow-xl p-6 animate-slide-up"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-card-foreground">
            {editTask ? "Edit Task" : "New Task"}
          </h2>
          <button
            type="button"
            data-ocid="todo.close_button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label
              htmlFor="task-title"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block"
            >
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              data-ocid="todo.input"
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError("");
              }}
              className="rounded-xl"
            />
            {titleError && (
              <p className="text-xs text-destructive mt-1">{titleError}</p>
            )}
          </div>

          <div>
            <Label
              htmlFor="task-desc"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block"
            >
              Description
            </Label>
            <Textarea
              id="task-desc"
              data-ocid="todo.textarea"
              placeholder="Add some details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="task-date"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block"
              >
                Date
              </Label>
              <Input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label
                htmlFor="task-time"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block"
              >
                Time
              </Label>
              <Input
                id="task-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-ocid="todo.select" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🔴 High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            data-ocid="todo.cancel_button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            data-ocid="todo.save_button"
            className="flex-1 rounded-xl bg-primary text-primary-foreground"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
              </>
            ) : editTask ? (
              "Update Task"
            ) : (
              "Add Task"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
