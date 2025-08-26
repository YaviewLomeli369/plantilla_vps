import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InlineEditor } from "@/components/inline-editor/InlineEditor";
import { InlineTextarea } from "@/components/inline-editor/InlineTextarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import type { BlogPost } from "@shared/schema";
import { Calendar, User, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface BlogPostCardEditableProps {
  post: BlogPost;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: string) => void;
}

export function BlogPostCardEditable({ post, onEdit, onDelete }: BlogPostCardEditableProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperuser = user?.role === 'superuser';

  const updatePostMutation = useMutation({
    mutationFn: async (data: Partial<BlogPost>) => {
      return apiRequest(`/api/blog/${post.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseTags = (tagsString: string | null): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  };

  const formatTags = (tags: string[]): string => {
    return tags.join(', ');
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={post.isPublished ? 'default' : 'secondary'}>
              {post.isPublished ? 'Publicado' : 'Borrador'}
            </Badge>
            {post.isFeatured && (
              <Badge variant="outline">
                Destacado
              </Badge>
            )}
          </div>
          
          {isSuperuser && (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => onEdit?.(post)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete?.(post.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Title - Editable for superusers */}
        {isSuperuser ? (
          <InlineEditor
            value={post.title}
            onSave={async (newValue) => {
              await updatePostMutation.mutateAsync({
                title: newValue
              });
            }}
            placeholder="Título del artículo..."
            className="text-xl font-bold text-gray-900 leading-tight"
            tag="h3"
            maxLength={100}
          />
        ) : (
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">
            {post.title}
          </h3>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Excerpt - Editable for superusers */}
        <div className="mb-4">
          {isSuperuser ? (
            <InlineTextarea
              value={post.excerpt || ""}
              onSave={async (newValue) => {
                await updatePostMutation.mutateAsync({
                  excerpt: newValue
                });
              }}
              placeholder="Resumen del artículo..."
              className="text-gray-600 leading-relaxed"
              rows={3}
              maxLength={300}
            />
          ) : (
            <p className="text-gray-600 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Tags - Editable for superusers */}
        {(post.tags || isSuperuser) && (
          <div className="mb-4">
            {isSuperuser ? (
              <InlineEditor
                value={typeof post.tags === 'string' ? post.tags : (Array.isArray(post.tags) ? post.tags.join(', ') : "")}
                onSave={async (newValue) => {
                  await updatePostMutation.mutateAsync({
                    tags: newValue
                  });
                }}
                placeholder="Etiquetas separadas por comas..."
                className="text-sm text-primary"
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {parseTags(typeof post.tags === 'string' ? post.tags : (Array.isArray(post.tags) ? post.tags.join(', ') : "")).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{post.authorId || 'Admin'}</span>
            </div>
          </div>
          
          <Button size="sm" variant="outline" asChild>
            <Link href={`/blog/${post.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}