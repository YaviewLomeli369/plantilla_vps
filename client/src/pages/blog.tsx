import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPostCardEditable } from "@/components/blog/blog-post-card-editable";
import type { BlogPost, SiteConfig } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, User, Eye } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import AnimatedSection from "@/components/AnimatedSection";

export default function Blog() {
  const { user } = useAuth();
  const isSuperuser = user?.role === 'superuser';
  
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
    queryFn: () => apiRequest("/api/config", { method: "GET" }),
  });

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: () => apiRequest("/api/blog", { method: "GET" }),
  });

  const configData = config?.config as any;
  const appearance = configData?.appearance || {};

  // Filter published posts only for regular users, show all for superusers
  const displayPosts = isSuperuser ? (posts || []) : (posts?.filter(post => post.isPublished) || []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Blog" />
        <Navbar />
        <AnimatedSection>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Cargando artículos...</p>
            </div>
          </div>
        </AnimatedSection>
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
        title={`Blog - ${appearance.brandName || "Sistema Modular"}`}
        description="Artículos y noticias del blog"
      />
      <Navbar />
      
      {/* Hero Section */}
      <AnimatedSection>
        <section
          className="relative py-20 text-white"
          style={{
            backgroundImage: `url("https://plus.unsplash.com/premium_vector-1697729495822-c971c4a69f03?q=80&w=881&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            fontFamily: appearance.fontFamily || "inherit",
          }}
        >
          {/* Capa semitransparente */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Contenido */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: appearance.fontFamily || "inherit" }}
            >
              Blog
            </h1>
            <p
              className="text-xl text-blue-100"
              style={{ fontFamily: appearance.fontFamily || "inherit" }}
            >
              Artículos, noticias y actualizaciones
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Blog Posts */}
      <AnimatedSection delay={0.2}>
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {displayPosts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No hay artículos disponibles
              </h2>
              <p className="text-gray-600">
                Pronto tendremos contenido interesante para compartir contigo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.map((post) => 
                isSuperuser ? (
                  <BlogPostCardEditable key={post.id} post={post} />
                ) : (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    {post.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img 
                          src={post.featuredImage} 
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Array.isArray(post.tags) && post.tags.map((tag: string, index: number) => (
                          <Badge key={`${post.id}-${tag}-${index}`} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="line-clamp-2 text-base sm:text-lg break-word">
                        <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors block">
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-3 text-sm break-word">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-2">
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap gap-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>Admin</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {post.views && (
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          )}
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </div>
  );
}