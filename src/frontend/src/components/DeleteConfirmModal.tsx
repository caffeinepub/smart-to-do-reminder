import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  const handleBackdropKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        onKeyUp={handleBackdropKey}
        aria-label="Close dialog"
      />
      <div
        data-ocid="todo.dialog"
        className="relative w-[calc(100%-2rem)] max-w-sm bg-card rounded-2xl shadow-xl p-6 animate-fade-in"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="font-display font-bold text-base text-card-foreground mb-2">
            Delete Task?
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              data-ocid="todo.cancel_button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              data-ocid="todo.confirm_button"
              variant="destructive"
              className="flex-1 rounded-xl"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
