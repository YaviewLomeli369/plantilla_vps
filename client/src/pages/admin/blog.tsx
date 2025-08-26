import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  User,
  FileText,
  Archive
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  isPublished: boolean;
  isFeatured: boolean;
  authorId: string;
  authorName?: string;
  tags: string[];
  featuredImage?: string;
  publishedAt?: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export default function AdminBlog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    slug: "",
    isPublished: false,
    isFeatured: false,
    tags: [] as string[],
    featuredImage: "",
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Real API data
  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
    queryFn: () => apiRequest("/api/blog", { method: "GET" }),
  });

  const mockCategories: BlogCategory[] = [
    { id: "1", name: "Servicios", slug: "servicios", description: "Posts sobre nuestros servicios", postCount: 5 },
    { id: "2", name: "Noticias", slug: "noticias", description: "Últimas noticias del sector", postCount: 8 },
    { id: "3", name: "Tutoriales", slug: "tutoriales", description: "Guías paso a paso", postCount: 12 },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(post.tags) && post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    let postStatus = 'draft';
    if (post.isPublished && post.publishedAt) {
      postStatus = 'published';
    } else if (!post.isPublished && post.publishedAt) {
      postStatus = 'archived';
    }
    
    const matchesStatus = statusFilter === "all" || postStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: blogPosts.length,
    published: blogPosts.filter(p => p.isPublished && p.publishedAt).length,
    draft: blogPosts.filter(p => !p.isPublished && !p.publishedAt).length,
    archived: blogPosts.filter(p => !p.isPublished && p.publishedAt).length,
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      return await apiRequest("/api/blog", {
        method: "POST",
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post creado correctamente" });
      setShowCreateDialog(false);
      setNewPost({
        title: "",
        content: "",
        excerpt: "",
        slug: "",
        isPublished: false,
        isFeatured: false,
        tags: [],
        featuredImage: "",
      });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al crear el post",
        description: "No se pudo crear el post"
      });
    },
  });

  const handleCreatePost = () => {
    // Handle tags and publishing
    const postData = {
      ...newPost,
      publishedAt: newPost.isPublished ? new Date().toISOString() : null,
      tags: Array.isArray(newPost.tags) ? newPost.tags : 
            typeof newPost.tags === 'string' ? 
            newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
    };
    createPostMutation.mutate(postData);
  };

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/blog/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post eliminado correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al eliminar el post",
        description: "No se pudo eliminar el post"
      });
    },
  });

  const editPostMutation = useMutation({
    mutationFn: async ({ id, postData }: { id: string; postData: any }) => {
      return await apiRequest(`/api/blog/${id}`, {
        method: "PUT",
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post actualizado correctamente" });
      setEditingPost(null);
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al actualizar el post",
        description: "No se pudo actualizar el post"
      });
    },
  });

  const archivePostMutation = useMutation({
    mutationFn: async (id: string) => {
      // Find the post to get its current publishedAt date
      const post = blogPosts.find(p => p.id === id);
      return await apiRequest(`/api/blog/${id}`, {
        method: "PUT",
        body: JSON.stringify({ 
          isPublished: false,
          publishedAt: post?.publishedAt || new Date().toISOString() // Keep existing published date or set current
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Post archivado correctamente" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al archivar el post",
        description: "No se pudo archivar el post"
      });
    },
  });

  const handleUpdatePost = () => {
    if (!editingPost) return;
    
    const postData = {
      ...editingPost,
      publishedAt: editingPost.isPublished ? 
        (editingPost.publishedAt || new Date().toISOString()) : 
        editingPost.publishedAt, // Keep existing publishedAt if already set
      tags: Array.isArray(editingPost.tags) ? editingPost.tags :
            typeof editingPost.tags === 'string' ? 
            editingPost.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : []
    };
    editPostMutation.mutate({ id: editingPost.id, postData });
  };

  const handleDeletePost = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const handleArchivePost = (id: string) => {
    if (confirm("¿Estás seguro de que quieres archivar este post?")) {
      archivePostMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "archived":
        return "outline";
      default:
        return "outline";
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Blog</h1>
            <p className="text-gray-600 mt-1">Administra artículos, categorías y contenido del blog</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Post
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <Eye className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
                </div>
                <Edit className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorías</p>
                  <p className="text-2xl font-bold text-blue-600">{mockCategories.length}</p>
                </div>
                <Tag className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Posts del Blog ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[240px]">Título</TableHead>
                    <TableHead className="w-[100px]">Autor</TableHead>
                    <TableHead className="w-[110px]">Estado</TableHead>
                    <TableHead className="w-[120px]">Fecha</TableHead>
                    <TableHead className="w-[140px]">Tags</TableHead>
                    <TableHead className="w-[90px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{post.title}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {post.excerpt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 max-w-20">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">Admin</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(
                        post.isPublished && post.publishedAt ? 'published' : 
                        !post.isPublished && post.publishedAt ? 'archived' : 'draft'
                      ) as any} className="capitalize">
                        {post.isPublished && post.publishedAt ? 'Publicado' : 
                         !post.isPublished && post.publishedAt ? 'Archivado' : 'Borrador'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 max-w-24">
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-32">
                        {(Array.isArray(post.tags) ? post.tags : []).slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs truncate max-w-16">
                            {tag}
                          </Badge>
                        ))}
                        {(Array.isArray(post.tags) ? post.tags : []).length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{(Array.isArray(post.tags) ? post.tags : []).length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingPost(post)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleArchivePost(post.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            Archivar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create Post Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo Post del Blog</DialogTitle>
              <DialogDescription>
                Crea un nuevo artículo para el blog
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewPost({
                        ...newPost, 
                        title,
                        slug: generateSlug(title)
                      });
                    }}
                    placeholder="Título del post"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={newPost.slug}
                    onChange={(e) => setNewPost({...newPost, slug: e.target.value})}
                    placeholder="url-del-post"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Extracto</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                  placeholder="Breve descripción del post..."
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Contenido completo del post..."
                  rows={10}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={newPost.isPublished ? "published" : "draft"} 
                    onValueChange={(value) => setNewPost({
                      ...newPost, 
                      isPublished: value === "published"
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featuredImage">Imagen Destacada (URL)</Label>
                  <Input
                    id="featuredImage"
                    value={newPost.featuredImage}
                    onChange={(e) => setNewPost({...newPost, featuredImage: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separados por comas)</Label>
                <Input
                  id="tags"
                  value={Array.isArray(newPost.tags) ? newPost.tags.join(", ") : newPost.tags}
                  onChange={(e) => setNewPost({
                    ...newPost, 
                    tags: e.target.value
                  })}
                  placeholder="tecnología, tutorial, guía"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? "Creando..." : "Crear Post"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Post Dialog */}
        <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Post</DialogTitle>
              <DialogDescription>
                Modifica el contenido del post
              </DialogDescription>
            </DialogHeader>
            
            {editingPost && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={editingPost.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditingPost({
                          ...editingPost,
                          title,
                          slug: generateSlug(title)
                        });
                      }}
                      placeholder="Título del post"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-slug">Slug (URL)</Label>
                    <Input
                      id="edit-slug"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({...editingPost, slug: e.target.value})}
                      placeholder="url-del-post"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-excerpt">Extracto</Label>
                  <Textarea
                    id="edit-excerpt"
                    value={editingPost.excerpt || ''}
                    onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                    placeholder="Breve descripción del post..."
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Contenido</Label>
                  <Textarea
                    id="edit-content"
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                    placeholder="Contenido completo del post..."
                    rows={10}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select 
                      value={editingPost.isPublished ? "published" : "draft"} 
                      onValueChange={(value) => setEditingPost({
                        ...editingPost, 
                        isPublished: value === "published"
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-featuredImage">Imagen Destacada (URL)</Label>
                    <Input
                      id="edit-featuredImage"
                      value={editingPost.featuredImage || ''}
                      onChange={(e) => setEditingPost({...editingPost, featuredImage: e.target.value})}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (separados por comas)</Label>
                  <Input
                    id="edit-tags"
                    value={Array.isArray(editingPost.tags) ? editingPost.tags.join(', ') : editingPost.tags || ''}
                    onChange={(e) => setEditingPost({...editingPost, tags: e.target.value})}
                    placeholder="tecnología, noticias, tutorial"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingPost(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdatePost} disabled={editPostMutation.isPending}>
                    {editPostMutation.isPending ? "Actualizando..." : "Actualizar Post"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}