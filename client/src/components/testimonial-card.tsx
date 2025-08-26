import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Testimonial } from "@shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial;
  featured?: boolean;
}

export function TestimonialCard({ testimonial, featured = false }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card className={`h-full ${featured ? "ring-2 ring-primary shadow-lg" : ""}`}>
      <CardContent className="p-6">
        {featured && (
          <Badge className="mb-4" variant="default">
            Destacado
          </Badge>
        )}
        
        <div className="flex items-start mb-4">
          <Quote className="h-6 w-6 text-primary flex-shrink-0 mr-3 mt-1" />
          <p className="text-gray-700 italic leading-relaxed">
            {testimonial.content}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div>
            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
            <div className="flex items-center mt-1">
              {renderStars(testimonial.rating)}
              <span className="ml-2 text-sm text-gray-600">
                {testimonial.rating}/5
              </span>
            </div>
          </div>
          
          {testimonial.position && (
            <div className="text-right">
              <p className="text-sm text-gray-600">{testimonial.position}</p>
              {testimonial.company && (
                <p className="text-xs text-gray-500">{testimonial.company}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}