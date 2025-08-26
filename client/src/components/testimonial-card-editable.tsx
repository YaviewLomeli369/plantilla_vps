import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { InlineTextarea } from "@/components/inline-editor/InlineTextarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { Testimonial } from "@shared/schema";
import { Star, Crown } from "lucide-react";

interface TestimonialCardEditableProps {
  testimonial: Testimonial;
  featured?: boolean;
}

export function TestimonialCardEditable({ testimonial, featured = false }: TestimonialCardEditableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperuser = user?.role === 'superuser';

  const updateTestimonialMutation = useMutation({
    mutationFn: async (data: Partial<Testimonial>) => {
      return apiRequest(`/api/testimonials/${testimonial.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
    },
  });

  return (
    <Card className={`h-full relative ${featured ? 'ring-2 ring-primary/20 shadow-lg' : ''}`}>
      {featured && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
          <Crown className="w-4 h-4" />
        </div>
      )}
      
      <CardContent className="p-6 flex flex-col h-full">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant={testimonial.isApproved ? "default" : "secondary"}>
              {testimonial.isApproved ? "Aprobado" : "Pendiente"}
            </Badge>
            {testimonial.isFeatured && (
              <Badge variant="outline">
                <Crown className="w-3 h-3 mr-1" />
                Destacado
              </Badge>
            )}
          </div>
          {/* Rating */}
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < (testimonial.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content - Editable for superusers */}
        <div className="flex-grow">
          {isSuperuser ? (
            <InlineTextarea
              value={testimonial.content || ""}
              onSave={async (newValue) => {
                await updateTestimonialMutation.mutateAsync({
                  content: newValue
                });
              }}
              placeholder="Contenido del testimonial..."
              className="text-gray-700 mb-4"
              rows={4}
              maxLength={500}
            />
          ) : (
            <blockquote className="text-gray-700 mb-4">
              "{testimonial.content}"
            </blockquote>
          )}
        </div>

        {/* Author Info - Editable for superusers */}
        <div className="mt-auto">
          <div className="border-t pt-4">
            {isSuperuser ? (
              <>
                <InlineEditor
                  value={testimonial.name || ""}
                  onSave={async (newValue) => {
                    await updateTestimonialMutation.mutateAsync({
                      name: newValue
                    });
                  }}
                  placeholder="Nombre del cliente..."
                  className="font-semibold text-gray-900 block mb-1"
                />
                <InlineEditor
                  value={testimonial.email || ""}
                  onSave={async (newValue) => {
                    await updateTestimonialMutation.mutateAsync({
                      email: newValue
                    });
                  }}
                  placeholder="Email (opcional)..."
                  className="text-gray-600 text-sm"
                />
              </>
            ) : (
              <>
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                {testimonial.email && (
                  <div className="text-gray-600 text-sm">
                    {testimonial.email}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}