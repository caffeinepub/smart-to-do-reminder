import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import type { Task } from "../backend.d";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (task: Task) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

const PRIORITY_CLASSES: Record<string, string> = {
  low: "priority-low",
  medium: "priority-medium",
  high: "priority-high",
};

function formatDueDateTime(dueDate: string, dueTime: string): string {
  if (!dueDate) return "";
  const date = new Date(`${dueDate}T${dueTime || "00:00"}`);
  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (!dueTime) return datePart;
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart} at ${timePart}`;
}

export function TaskCard({
  task,
  index,
  onEdit,
  onDelete,
  onToggleComplete,
  isDeleting,
  isUpdating,
}: TaskCardProps) {
  const cardIndex = index + 1;

  return (
    <div
      data-ocid={`todo.item.${cardIndex}`}
      className="bg-card text-card-foreground rounded-2xl shadow-card dark:shadow-card-dark border border-border p-4 animate-fade-in transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            data-ocid={`todo.checkbox.${cardIndex}`}
            checked={task.completed}
            onCheckedChange={() => onToggleComplete(task)}
            disabled={isUpdating}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-sm leading-tight mb-1 ${
              task.completed
                ? "line-through text-muted-foreground"
                : "text-card-foreground"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mb-2">
            {formatDueDateTime(task.dueDate, task.dueTime)}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                PRIORITY_CLASSES[task.priority] || "priority-low"
              }`}
            >
              {PRIORITY_LABELS[task.priority] || task.priority.toUpperCase()}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                task.completed
                  ? "status-completed border-transparent"
                  : "status-pending bg-transparent"
              }`}
            >
              {task.completed ? "Completed" : "Pending"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            data-ocid={`todo.edit_button.${cardIndex}`}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            data-ocid={`todo.delete_button.${cardIndex}`}
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
