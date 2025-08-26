import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { InlineTextarea } from "@/components/inline-editor/InlineTextarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Faq } from "@shared/schema";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FaqCardEditableProps {
  faq: Faq;
  onEdit?: (faq: Faq) => void;
  onDelete?: (faqId: string) => void;
}

export function FaqCardEditable({ faq, onEdit, onDelete }: FaqCardEditableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperuser = user?.role === 'superuser';

  const updateFaqMutation = useMutation({
    mutationFn: async (data: Partial<Faq>) => {
      return apiRequest(`/api/faqs/${faq.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
    },
  });

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CollapsibleTrigger asChild>
              <div className="flex items-start gap-3 flex-1 cursor-pointer text-left">
                {/* Question - Editable for superusers */}
                {isSuperuser ? (
                  <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                    <InlineTextarea
                      value={faq.question || ""}
                      onSave={async (newValue) => {
                        await updateFaqMutation.mutateAsync({
                          question: newValue
                        });
                      }}
                      placeholder="Pregunta frecuente..."
                      className="font-medium text-gray-900 leading-tight"
                      rows={2}
                      maxLength={200}
                    />
                  </div>
                ) : (
                  <CardTitle className="text-base font-medium text-gray-900 leading-tight flex-1">
                    {faq.question}
                  </CardTitle>
                )}
                
                <div className="flex-shrink-0 ml-2">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            {isSuperuser && (
              <div className="flex gap-1 ml-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit?.(faq)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete?.(faq.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-2">
            {/* Answer - Editable for superusers */}
            {isSuperuser ? (
              <InlineTextarea
                value={faq.answer || ""}
                onSave={async (newValue) => {
                  await updateFaqMutation.mutateAsync({
                    answer: newValue
                  });
                }}
                placeholder="Respuesta a la pregunta..."
                className="text-gray-600 leading-relaxed"
                rows={4}
              />
            ) : (
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {faq.answer}
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}