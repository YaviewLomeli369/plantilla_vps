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
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Layout,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Section as SectionType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminSections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSection, setEditingSection] = useState<SectionType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSection, setNewSection] = useState({
    name: "",
    title: "",
    content: "",
    type: "content",
    order: 0,
    isActive: true
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sections, isLoading } = useQuery<SectionType[]>({
    queryKey: ["/api/sections"],
  });

  const createSectionMutation = useMutation({
    mutationFn: async (sectionData: typeof newSection) => {
      return await apiRequest("/api/sections", {
        method: "POST",
        body: JSON.stringify(sectionData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      setShowCreateDialog(false);
      setNewSection({
        name: "",
        title: "",
        content: "",
        type: "content",
        order: 0,
        isActive: true
      });
      toast({ title: "Sección creada correctamente" });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SectionType> }) => {
      return await apiRequest(`/api/sections/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      setEditingSection(null);
      toast({ title: "Sección actualizada correctamente" });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/sections/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sections"] });
      toast({ title: "Sección eliminada correctamente" });
    },
  });

  const filteredSections = sections?.filter(section =>
    section.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSections = filteredSections.sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    createSectionMutation.mutate(newSection);
  };

  const handleUpdateSection = (section: SectionType, updates: Partial<SectionType>) => {
    updateSectionMutation.mutate({ id: section.id, data: updates });
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sección?")) {
      deleteSectionMutation.mutate(id);
    }
  };

  const moveSection = (section: SectionType, direction: "up" | "down") => {
    const currentOrder = section.order || 0;
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    handleUpdateSection(section, { order: newOrder });
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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Secciones</h1>
            <p className="text-gray-600 mt-1">Administra las secciones del homepage</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Sección
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar secciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sections Table */}
        <Card>
          <CardHeader>
            <CardTitle>Secciones ({sortedSections.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{section.order}</span>
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(section, "up")}
                            className="h-4 w-4 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(section, "down")}
                            className="h-4 w-4 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>{section.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{section.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={section.isActive || false}
                          onCheckedChange={(checked) => 
                            handleUpdateSection(section, { isActive: checked })
                          }
                        />
                        {section.isActive ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
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
                          <DropdownMenuItem 
                            onClick={() => setEditingSection(section)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSection(section.id)}
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
          </CardContent>
        </Card>

        {/* Create Section Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nueva Sección</DialogTitle>
              <DialogDescription>
                Crea una nueva sección para el homepage
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={newSection.name}
                    onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                    placeholder="nombre-seccion"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={newSection.type} 
                    onValueChange={(value) => setNewSection({...newSection, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">Hero</SelectItem>
                      <SelectItem value="about">Acerca de</SelectItem>
                      <SelectItem value="services">Servicios</SelectItem>
                      <SelectItem value="content">Contenido</SelectItem>
                      <SelectItem value="gallery">Galería</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  placeholder="Título de la sección"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <Textarea
                  id="content"
                  value={newSection.content}
                  onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                  placeholder="Contenido de la sección"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Orden</Label>
                  <Input
                    id="order"
                    type="number"
                    value={newSection.order}
                    onChange={(e) => setNewSection({...newSection, order: parseInt(e.target.value) || 0})}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={newSection.isActive}
                    onCheckedChange={(checked) => setNewSection({...newSection, isActive: checked})}
                  />
                  <Label>Activa</Label>
                </div>
              </div>
            </form>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateSection} disabled={createSectionMutation.isPending}>
                {createSectionMutation.isPending ? "Creando..." : "Crear Sección"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Section Dialog */}
        {editingSection && (
          <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Sección</DialogTitle>
                <DialogDescription>
                  Modifica los datos de la sección
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre</Label>
                    <Input
                      id="edit-name"
                      value={editingSection.name}
                      onChange={(e) => setEditingSection({...editingSection, name: e.target.value})}
                      placeholder="nombre-seccion"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipo</Label>
                    <Select 
                      value={editingSection.type} 
                      onValueChange={(value) => setEditingSection({...editingSection, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero</SelectItem>
                        <SelectItem value="about">Acerca de</SelectItem>
                        <SelectItem value="services">Servicios</SelectItem>
                        <SelectItem value="content">Contenido</SelectItem>
                        <SelectItem value="gallery">Galería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    value={editingSection.title || ""}
                    onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                    placeholder="Título de la sección"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Contenido</Label>
                  <Textarea
                    id="edit-content"
                    value={editingSection.content || ""}
                    onChange={(e) => setEditingSection({...editingSection, content: e.target.value})}
                    placeholder="Contenido de la sección"
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-order">Orden</Label>
                    <Input
                      id="edit-order"
                      type="number"
                      value={editingSection.order || 0}
                      onChange={(e) => setEditingSection({...editingSection, order: parseInt(e.target.value) || 0})}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      checked={editingSection.isActive || false}
                      onCheckedChange={(checked) => setEditingSection({...editingSection, isActive: checked})}
                    />
                    <Label>Activa</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingSection(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => handleUpdateSection(editingSection, editingSection)} 
                  disabled={updateSectionMutation.isPending}
                >
                  {updateSectionMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}