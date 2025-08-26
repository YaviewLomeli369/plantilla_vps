import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BlogPost, SiteConfig } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, User, Eye, ArrowLeft, Share, Copy, Check } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp } from "react-icons/fa";

export default function BlogPost() {
  const [match, params] = useRoute("/blog/:slug");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    queryFn: () => apiRequest("/api/config", { method: "GET" }),
  });

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog", params?.slug],
    queryFn: () => apiRequest(`/api/blog/slug/${params?.slug}`, { method: "GET" }),
    enabled: !!params?.slug,
  });

  // Increment views mutation
  const incrementViewsMutation = useMutation({
    mutationFn: async (postId: string) => {
      return await apiRequest(`/api/blog/${postId}/view`, {
        method: "PUT",
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
  });

  const configData = config?.config as any;
  const appearance = configData?.appearance || {};

  // Share functionality
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const postTitle = post?.title || '';
  const postExcerpt = post?.excerpt || '';

  const shareOptions = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${postTitle} ${currentUrl}`)}`
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace del artículo se ha copiado al portapapeles.",
      });
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace. Inténtalo de nuevo.",
      });
    }
  };

  const handleSocialShare = (platform: keyof typeof shareOptions) => {
    window.open(shareOptions[platform], '_blank', 'width=600,height=400');
  };

  // Increment view count when component mounts
  React.useEffect(() => {
    if (post?.id) {
      incrementViewsMutation.mutate(post.id);
    }
  }, [post?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Cargando..." />
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Cargando artículo...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Artículo no encontrado" />
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artículo no encontrado</h1>
            <p className="text-gray-600 mb-6">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ 
      backgroundColor: appearance.backgroundColor || 'inherit',
      color: appearance.textColor || 'inherit',
      fontFamily: appearance.fontFamily || 'inherit'
    }}>
      <SEOHead 
        title={`${post.title} - ${appearance.brandName || "Sistema Modular"}`}
        description={post.excerpt || "Artículo del blog"}
      />
      <Navbar />
      
      {/* Article Header */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link href="/blog">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Blog
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.map((tag, index) => (
              <Badge key={`${post.id}-${tag}-${index}`} variant="secondary" className="bg-white/20 text-white">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: appearance.fontFamily || 'inherit' }}>
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between text-blue-100">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{post.authorName || 'Autor'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
              </div>
              {post.views && (
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} visualizaciones</span>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                  <Share className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                  <FaFacebook className="w-4 h-4 mr-2 text-blue-600" />
                  Compartir en Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                  <FaTwitter className="w-4 h-4 mr-2 text-blue-400" />
                  Compartir en Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                  <FaLinkedin className="w-4 h-4 mr-2 text-blue-700" />
                  Compartir en LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                  <FaWhatsapp className="w-4 h-4 mr-2 text-green-500" />
                  Compartir en WhatsApp
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyUrl}>
                  {copiedUrl ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copiedUrl ? "¡Enlace copiado!" : "Copiar enlace"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-8">
              {post.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {post.excerpt && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <p className="text-lg text-gray-700 italic">
                    {post.excerpt}
                  </p>
                </div>
              )}
              
              <div className="prose prose-lg max-w-none break-word">
                <div 
                  className="text-base leading-relaxed break-word"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}