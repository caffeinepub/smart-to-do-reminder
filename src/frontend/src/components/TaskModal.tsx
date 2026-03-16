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

/** Parse a 24h "HH:MM" string into {hour12, minute, ampm} */
function parse24h(time: string): {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
} {
  const [hStr, mStr] = time.split(":");
  let h = Number.parseInt(hStr, 10) || 9;
  const m = mStr || "00";
  const ampm: "AM" | "PM" = h < 12 ? "AM" : "PM";
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  return { hour: String(h), minute: m.padStart(2, "0"), ampm };
}

/** Convert {hour12, minute, ampm} back to "HH:MM" 24h */
function to24h(hour: string, minute: string, ampm: "AM" | "PM"): string {
  let h = Number.parseInt(hour, 10);
  if (ampm === "AM") {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

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

  // Derived time picker state from dueTime
  const parsed = parse24h(dueTime);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(parsed.ampm);

  useEffect(() => {
    if (open) {
      const timeStr = editTask?.dueTime || "09:00";
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description);
        setDueDate(editTask.dueDate || today);
        setPriority(editTask.priority || "medium");
      } else {
        setTitle("");
        setDescription("");
        setDueDate(today);
        setPriority("medium");
      }
      const p = parse24h(timeStr);
      setHour(p.hour);
      setMinute(p.minute);
      setAmpm(p.ampm);
      setDueTime(timeStr);
      setTitleError("");
    }
  }, [open, editTask]);

  // Keep dueTime in sync whenever picker changes
  const handleHourChange = (val: string) => {
    setHour(val);
    setDueTime(to24h(val, minute, ampm));
  };
  const handleMinuteChange = (val: string) => {
    setMinute(val);
    setDueTime(to24h(hour, val, ampm));
  };
  const handleAmpmChange = (val: "AM" | "PM") => {
    setAmpm(val);
    setDueTime(to24h(hour, minute, val));
  };

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
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 block">
                Time
              </Label>
              {/* Custom time picker: hour / minute / AM-PM */}
              <div className="flex items-center gap-1">
                {/* Hour */}
                <Select value={hour} onValueChange={handleHourChange}>
                  <SelectTrigger
                    data-ocid="todo.select"
                    className="rounded-xl w-[60px] px-2 text-center"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-muted-foreground font-semibold">:</span>

                {/* Minute */}
                <Select value={minute} onValueChange={handleMinuteChange}>
                  <SelectTrigger
                    data-ocid="todo.select"
                    className="rounded-xl w-[60px] px-2 text-center"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* AM / PM toggle */}
                <div className="flex rounded-xl overflow-hidden border border-input">
                  <button
                    type="button"
                    data-ocid="todo.toggle"
                    onClick={() => handleAmpmChange("AM")}
                    className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      ampm === "AM"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    data-ocid="todo.toggle"
                    onClick={() => handleAmpmChange("PM")}
                    className={`px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      ampm === "PM"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
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
