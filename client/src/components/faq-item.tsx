import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Faq } from "@shared/schema";

interface FaqItemProps {
  faq: Faq;
  onIncrementViews?: (id: string) => void;
  onVoteHelpful?: (id: string) => void;
  hasVoted?: boolean;
}

export function FaqItem({ faq, onIncrementViews, onVoteHelpful, hasVoted = false }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (!isOpen && onIncrementViews) {
      onIncrementViews(faq.id);
    }
    setIsOpen(!isOpen);
  };

  const handleVoteHelpful = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVoteHelpful) {
      onVoteHelpful(faq.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6">
          <div className="prose prose-sm max-w-none text-gray-700 mb-4">
            {faq.answer.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {faq.views !== undefined && (
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{faq.views} visualizaciones</span>
                </div>
              )}
              
              {faq.helpfulVotes !== undefined && faq.helpfulVotes > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  {faq.helpfulVotes} útil{faq.helpfulVotes !== 1 ? 'es' : ''}
                </Badge>
              )}
            </div>
            
            <Button
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              onClick={handleVoteHelpful}
              disabled={hasVoted}
              className="text-xs"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {hasVoted ? "¡Votado!" : "¿Te fue útil?"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}