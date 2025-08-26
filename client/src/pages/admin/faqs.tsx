import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ThumbsUp,
  FolderPlus
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Faq, FaqCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminFaqs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "unpublished">("all");
  const [isCreateFaqOpen, setIsCreateFaqOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: faqs, isLoading: faqsLoading, refetch } = useQuery<Faq[]>({
    queryKey: ["/api/faqs"],
    refetchOnMount: true,
  });

  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery<FaqCategory[]>({
    queryKey: ["/api/faq-categories"],
    refetchOnMount: true,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await apiRequest("/api/faq-categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq-categories"] });
      setIsCreateCategoryOpen(false);
      toast({ title: "Categoría creada correctamente" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/faq-categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "Categoría eliminada correctamente" });
    },
  });

  const createFaqMutation = useMutation({
    mutationFn: async (data: { question: string; answer: string; categoryId?: string }) => {
      return await apiRequest("/api/faqs", {
        method: "POST",
        body: JSON.stringify({ ...data, isPublished: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setIsCreateFaqOpen(false);
      toast({ title: "FAQ creado correctamente" });
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Faq> }) => {
      return await apiRequest(`/api/faqs/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      setEditingFaq(null);
      toast({ title: "FAQ actualizado correctamente" });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/faqs/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faqs"] });
      toast({ title: "FAQ eliminado correctamente" });
    },
  });

  const filteredFaqs = faqs?.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || faq.categoryId === categoryFilter;
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && faq.isPublished) ||
                         (statusFilter === "unpublished" && !faq.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const stats = {
    total: faqs?.length || 0,
    published: faqs?.filter(f => f.isPublished).length || 0,
    unpublished: faqs?.filter(f => !f.isPublished).length || 0,
    totalViews: faqs?.reduce((sum, f) => sum + (f.views || 0), 0) || 0,
  };

  const EditFaqDialog = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [categoryId, setCategoryId] = useState("");

    // Initialize form when editing FAQ changes
    React.useEffect(() => {
      if (editingFaq) {
        setQuestion(editingFaq.question);
        setAnswer(editingFaq.answer);
        setCategoryId(editingFaq.categoryId || "");
      }
    }, [editingFaq]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingFaq) return;
      
      updateFaqMutation.mutate({
        id: editingFaq.id,
        data: { 
          question, 
          answer, 
          categoryId: categoryId || undefined 
        }
      });
    };

    const handleClose = () => {
      setEditingFaq(null);
      setQuestion("");
      setAnswer("");
      setCategoryId("");
    };

    return (
      <Dialog open={!!editingFaq} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Editar FAQ</DialogTitle>
              <DialogDescription>
                Modifica la pregunta frecuente y su respuesta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-question">Pregunta</Label>
                <Input
                  id="edit-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-answer">Respuesta</Label>
                <Textarea
                  id="edit-answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría (opcional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateFaqMutation.isPending}>
                {updateFaqMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateCategoryDialog = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createCategoryMutation.mutate({ name, description });
      setName("");
      setDescription("");
    };

    return (
      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
              <DialogDescription>
                Agrega una nueva categoría para organizar tus FAQs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? "Creando..." : "Crear Categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const CreateFaqDialog = () => {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createFaqMutation.mutate({ 
        question, 
        answer, 
        categoryId: categoryId || undefined 
      });
      setQuestion("");
      setAnswer("");
      setCategoryId("");
    };

    return (
      <Dialog open={isCreateFaqOpen} onOpenChange={setIsCreateFaqOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Crear Nuevo FAQ</DialogTitle>
              <DialogDescription>
                Agrega una nueva pregunta frecuente con su respuesta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="question">Pregunta</Label>
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="answer">Respuesta</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría (opcional)</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createFaqMutation.isPending}>
                {createFaqMutation.isPending ? "Creando..." : "Crear FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (faqsLoading || categoriesLoading) {
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de FAQs</h1>
            <p className="text-gray-600 mt-1">Administra las preguntas frecuentes y sus categorías</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCreateCategoryOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
            <Button onClick={() => setIsCreateFaqOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo FAQ
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total FAQs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">{stats.published}</div>
              <div className="text-sm text-gray-600">Publicados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">{stats.unpublished}</div>
              <div className="text-sm text-gray-600">Borradores</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{stats.totalViews}</div>
              <div className="text-sm text-gray-600">Total Vistas</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "published" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("published")}
                >
                  Publicados
                </Button>
                <Button
                  variant={statusFilter === "unpublished" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("unpublished")}
                >
                  Borradores
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const faqCount = faqs?.filter(f => f.categoryId === category.id).length || 0;
                  return (
                    <div key={category.id} className="p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                            <DropdownMenuItem 
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {faqCount} FAQ{faqCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de FAQs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pregunta</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vistas</TableHead>
                  <TableHead>Votos Útiles</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaqs.map((faq) => {
                  const category = categories?.find(c => c.id === faq.categoryId);
                  return (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="font-medium truncate">{faq.question}</div>
                          <div className="text-sm text-gray-500 truncate">{faq.answer}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="secondary">{category.name}</Badge>
                        ) : (
                          <span className="text-gray-400">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {faq.isPublished ? (
                          <Badge variant="default">Publicado</Badge>
                        ) : (
                          <Badge variant="outline">Borrador</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          {faq.views || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-gray-400" />
                          {faq.helpfulVotes || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingFaq(faq)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => 
                                updateFaqMutation.mutate({
                                  id: faq.id,
                                  data: { isPublished: !faq.isPublished }
                                })
                              }
                            >
                              {faq.isPublished ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Despublicar
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Publicar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteFaqMutation.mutate(faq.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No se encontraron FAQs con los filtros aplicados"
                  : "No hay FAQs registrados"
                }
              </div>
            )}
          </CardContent>
        </Card>

        <CreateCategoryDialog />
        <CreateFaqDialog />
        <EditFaqDialog />
      </div>
    </AdminLayout>
  );
}
