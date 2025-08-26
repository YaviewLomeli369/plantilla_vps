import { useState, useRef, useEffect } from "react";
import ContentEditable from "react-contenteditable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Edit3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InlineEditorProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
  tag?: keyof JSX.IntrinsicElements;
  maxLength?: number;
}

export function InlineEditor({
  value,
  onSave,
  placeholder = "Click to edit...",
  multiline = false,
  className = "hidden",
  disabled = false,
  tag = "div",
  maxLength
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
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

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        // Select all text when starting to edit
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(contentRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
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
    if (e.key === "Enter" && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleChange = (e: any) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      setEditValue(newValue);
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
            ${isHovered && !disabled ? "bg-muted/50 rounded px-1 -mx-1" : ""}
            transition-colors duration-200
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
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
      <ContentEditable
        innerRef={contentRef}
        html={editValue}
        disabled={saveMutation.isPending}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        tagName={tag}
        className={`
          bg-background border border-input rounded px-2 py-1 min-h-[32px]
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          ${multiline ? "min-h-[80px]" : ""}
          ${saveMutation.isPending ? "opacity-50" : ""}
        `}
        style={{
          whiteSpace: multiline ? "pre-wrap" : "nowrap",
          overflow: multiline ? "auto" : "hidden",
        }}
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
    </div>
  );
}