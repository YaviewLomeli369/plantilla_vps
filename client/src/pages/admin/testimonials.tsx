import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  X, 
  Star, 
  MoreVertical, 
  Search, 
  Plus,
  Eye,
  Trash2,
  Edit
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Testimonial } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminTestimonials() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "featured">("all");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: testimonials, isLoading, refetch } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    refetchOnMount: true,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isApproved: true }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Testimonial aprobado",
        description: "El testimonial ha sido aprobado y es visible públicamente",
      });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      return await apiRequest(`/api/testimonials/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isFeatured }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Testimonial actualizado",
        description: "El estado destacado del testimonial ha sido actualizado",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/testimonials/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      toast({
        title: "Testimonial eliminado",
        description: "El testimonial ha sido eliminado correctamente",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; content: string; rating: number }) => {
      return await apiRequest(`/api/testimonials/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          content: data.content,
          rating: data.rating,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setEditDialogOpen(false);
      toast({
        title: "Testimonial actualizado",
        description: "El testimonial ha sido editado correctamente",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el testimonial",
      });
    },
  });

  const handleViewTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setViewDialogOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setEditName(testimonial.name);
    setEditContent(testimonial.content);
    setEditRating(testimonial.rating);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedTestimonial) return;
    
    editMutation.mutate({
      id: selectedTestimonial.id,
      name: editName,
      content: editContent,
      rating: editRating,
    });
  };

  const filteredTestimonials = testimonials?.filter(testimonial => {
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "pending" && !testimonial.isApproved) ||
                         (statusFilter === "approved" && testimonial.isApproved && !testimonial.isFeatured) ||
                         (statusFilter === "featured" && testimonial.isFeatured);

    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: testimonials?.length || 0,
    pending: testimonials?.filter(t => !t.isApproved).length || 0,
    approved: testimonials?.filter(t => t.isApproved && !t.isFeatured).length || 0,
    featured: testimonials?.filter(t => t.isFeatured).length || 0,
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Testimonios</h1>
            <p className="text-gray-600 mt-1">Administra los testimonios y reseñas de tus clientes</p>
          </div>
          {/* <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Testimonial
          </Button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
              <div className="text-sm text-gray-600">Aprobados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{stats.featured}</div>
              <div className="text-sm text-gray-600">Destacados</div>
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
                    placeholder="Buscar por nombre o contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pendientes
                </Button>
                <Button
                  variant={statusFilter === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("approved")}
                >
                  Aprobados
                </Button>
                <Button
                  variant={statusFilter === "featured" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("featured")}
                >
                  Destacados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Testimonios</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Cliente</TableHead>
                  <TableHead className="min-w-[200px]">Contenido</TableHead>
                  <TableHead className="min-w-[100px]">Calificación</TableHead>
                  <TableHead className="min-w-[120px]">Estado</TableHead>
                  <TableHead className="min-w-[100px]">Fecha</TableHead>
                  <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{testimonial.name}</div>
                        {testimonial.email && (
                          <div className="text-sm text-gray-500">{testimonial.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate">{testimonial.content}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {testimonial.isFeatured && (
                          <Badge variant="default">Destacado</Badge>
                        )}
                        {testimonial.isApproved ? (
                          <Badge variant="secondary">Aprobado</Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(testimonial.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTestimonial(testimonial)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Completo
                          </DropdownMenuItem>
                          {!testimonial.isApproved && (
                            <DropdownMenuItem
                              onClick={() => approveMutation.mutate(testimonial.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Aprobar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => 
                              toggleFeaturedMutation.mutate({
                                id: testimonial.id,
                                isFeatured: !testimonial.isFeatured
                              })
                            }
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {testimonial.isFeatured ? "Quitar Destacado" : "Marcar Destacado"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTestimonial(testimonial)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteMutation.mutate(testimonial.id)}
                            className="text-destructive"
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

            {filteredTestimonials.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || statusFilter !== "all" 
                  ? "No se encontraron testimonios con los filtros aplicados"
                  : "No hay testimonios registrados"
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Testimonial Completo</DialogTitle>
            </DialogHeader>
            {selectedTestimonial && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Cliente</Label>
                  <p className="mt-1 text-gray-900">{selectedTestimonial.name}</p>
                  {selectedTestimonial.email && (
                    <p className="text-sm text-gray-500">{selectedTestimonial.email}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Calificación</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: selectedTestimonial.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({selectedTestimonial.rating}/5)</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Contenido</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{selectedTestimonial.content}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Estado</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedTestimonial.isFeatured && (
                      <Badge variant="default">Destacado</Badge>
                    )}
                    {selectedTestimonial.isApproved ? (
                      <Badge variant="secondary">Aprobado</Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Fecha de creación</Label>
                  <p className="mt-1 text-gray-900">{new Date(selectedTestimonial.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre del Cliente</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <Label htmlFor="edit-rating">Calificación</Label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= editRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">({editRating}/5)</span>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-content">Contenido</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Contenido del testimonial"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
