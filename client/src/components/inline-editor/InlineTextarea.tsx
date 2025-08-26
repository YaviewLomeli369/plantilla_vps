import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InlineTextareaProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
}

export function InlineTextarea({
  value,
  onSave,
  placeholder = "Click to edit...",
  className = "hidden",
  disabled = false,
  maxLength,
  rows = 3
}: InlineTextareaProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const saveMutation = useMutation({
    mutationFn: () => onSave(editValue.trim()),
    onSuccess: () => {
      setIsEditing(false);
      toast({
        title: "Guardado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
      console.error("Save error:", error);
    }
  });

  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 0);
  };

  const handleSave = () => {
    if (editValue.trim() !== value.trim()) {
      saveMutation.mutate();
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value || (typeof value === 'string' && value.trim() === "");

  if (!isEditing) {
    return (
      <div
        className={`relative group cursor-pointer ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div 
          className={`
            ${isEmpty ? "text-muted-foreground italic" : ""}
            ${isHovered && !disabled ? "bg-muted/50 rounded px-2 py-1 -mx-2 -my-1" : ""}
            transition-colors duration-200
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
            whitespace-pre-wrap min-h-[60px] flex items-start
          `}
        >
          {displayValue}
        </div>
        {isHovered && !disabled && (
          <Edit3 className="absolute -right-6 top-0 w-4 h-4 text-muted-foreground opacity-70" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => {
          const newValue = e.target.value;
          if (!maxLength || newValue.length <= maxLength) {
            setEditValue(newValue);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={saveMutation.isPending}
        className={`
          ${saveMutation.isPending ? "opacity-50" : ""}
        `}
      />
      
      {maxLength && (
        <div className="text-xs text-muted-foreground mt-1">
          {editValue.length} / {maxLength}
        </div>
      )}

      <div className="flex gap-1 mt-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saveMutation.isPending || editValue.trim() === ""}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Check className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={saveMutation.isPending}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground mt-1">
        Tip: Ctrl/Cmd + Enter para guardar, Esc para cancelar
      </div>
    </div>
  );
}