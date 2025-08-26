import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Mail, 
  Search, 
  MoreVertical,
  Archive,
  ArchiveRestore,
  Trash2,
  Reply,
  MailOpen,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Save
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { ContactMessage, ContactInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

function AdminContact() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "archived">("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [contactFormData, setContactFormData] = useState({
    phone: "",
    email: "",
    address: "",
    hours: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    mapsUrl: "https://www.google.com/maps/place/Marflo+Corporativo/@19.3714581,-99.1825507,17z/data=!3m1!4b1!4m6!3m5!1s0x85d1ff8fedfeed27:0x4a8953bea635b5c5!8m2!3d19.3714531!4d-99.1799758!16s%2Fg%2F1ygvstg35?entry=ttu&g_ep=EgoyMDI1MDgxMy4wIKXMDSoASAFQAw%3D%3D",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: messages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact/messages"],
  });

  const { data: contactInfo, isLoading: contactInfoLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact/info"],
  });

  // Set contact form data when contactInfo changes
  React.useEffect(() => {
    if (contactInfo) {
      setContactFormData({
        phone: contactInfo.phone || "",
        email: contactInfo.email || "",
        address: contactInfo.address || "",
        hours: contactInfo.hours || "",
        facebook: (contactInfo.socialLinks as any)?.facebook || "",
        instagram: (contactInfo.socialLinks as any)?.instagram || "",
        twitter: (contactInfo.socialLinks as any)?.twitter || "",
        linkedin: (contactInfo.socialLinks as any)?.linkedin || "",
        youtube: (contactInfo.socialLinks as any)?.youtube || "",
        tiktok: (contactInfo.socialLinks as any)?.tiktok || "",
        mapsUrl: (contactInfo as any)?.mapsUrl || "",
      });
    }
  }, [contactInfo]);

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContactMessage> }) => {
      return await apiRequest(`/api/contact/messages/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/contact/messages/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({ title: "Mensaje eliminado correctamente" });
    },
  });

  const updateContactInfoMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/contact/info", {
        method: "PUT",
        body: JSON.stringify({
          phone: data.phone,
          email: data.email,
          address: data.address,
          hours: data.hours,
          mapsUrl: data.mapsUrl,
          socialLinks: {
            facebook: data.facebook,
            instagram: data.instagram,
            twitter: data.twitter,
            linkedin: data.linkedin,
            youtube: data.youtube,
            tiktok: data.tiktok,
          },
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/info"] });
      toast({ title: "Información de contacto actualizada" });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/contact/messages/${id}/read`, {
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({ title: "Mensaje marcado como leído" });
    },
  });

  const markAsUnreadMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/contact/messages/${id}/unread`, {
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({ title: "Mensaje marcado como no leído" });
    },
  });

  const archiveMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/contact/messages/${id}/archive`, {
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({ title: "Mensaje archivado" });
    },
  });

  const unarchiveMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/contact/messages/${id}/unarchive`, {
        method: "PUT"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({ title: "Mensaje recuperado de archivo" });
    },
  });

  const replyToMessageMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      return await apiRequest(`/api/contact/messages/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({ title: "Respuesta enviada y email enviado al contacto" });
      setSelectedMessage(null);
      setReplyContent("");
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        title: "Error al enviar respuesta",
        description: "No se pudo enviar la respuesta"
      });
    },
  });

  const markAsRead = (message: ContactMessage) => {
    if (message.isRead) {
      markAsUnreadMutation.mutate(message.id);
    } else {
      markAsReadMutation.mutate(message.id);
    }
  };

  const toggleArchive = (message: ContactMessage) => {
    if (message.isArchived) {
      unarchiveMessageMutation.mutate(message.id);
    } else {
      archiveMessageMutation.mutate(message.id);
    }
  };



  const filteredMessages = messages?.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (message.subject && message.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "unread" && !message.isRead) ||
                         (statusFilter === "read" && message.isRead && !message.isArchived) ||
                         (statusFilter === "archived" && message.isArchived);

    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: messages?.length || 0,
    unread: messages?.filter(m => !m.isRead).length || 0,
    read: messages?.filter(m => m.isRead && !m.isArchived).length || 0,
    archived: messages?.filter(m => m.isArchived).length || 0,
    replied: messages?.filter(m => m.isReplied).length || 0,
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactInfoMutation.mutate(contactFormData);
  };

  // Memoized reply dialog to prevent re-renders causing flicker
  const MessageReplyDialog = React.useMemo(() => {
    if (!selectedMessage) return null;
    
    return (
      <Dialog open={true} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Responder Mensaje</DialogTitle>
            <DialogDescription>
              Responder a {selectedMessage.name} ({selectedMessage.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Mensaje Original:</h4>
              <p className="text-sm text-gray-600">{selectedMessage.message}</p>
              {selectedMessage.subject && (
                <div className="mt-2">
                  <span className="font-medium text-sm">Asunto: </span>
                  <span className="text-sm">{selectedMessage.subject}</span>
                </div>
              )}
              {selectedMessage.reply && (
                <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <h5 className="font-medium text-green-800">Respuesta enviada anteriormente:</h5>
                  <p className="text-sm text-green-700 mt-1">{selectedMessage.reply}</p>
                  {selectedMessage.repliedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      Enviado el {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="reply">Tu respuesta</Label>
              <Textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={5}
                placeholder="Escribe tu respuesta aquí..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedMessage && replyContent.trim()) {
                  replyToMessageMutation.mutate({ 
                    id: selectedMessage.id, 
                    reply: replyContent.trim() 
                  });
                }
              }}
              disabled={!replyContent.trim() || replyToMessageMutation.isPending}
            >
              {replyToMessageMutation.isPending ? "Enviando..." : "Enviar Respuesta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }, [selectedMessage, replyContent, replyToMessageMutation.isPending]);

  if (messagesLoading || contactInfoLoading) {
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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Contacto</h1>
            <p className="text-gray-600 mt-1">Administra los mensajes y la información de contacto</p>
          </div>
        </div>

        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="info">Información de Contacto</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Mensajes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                  <div className="text-sm text-gray-600">Sin Leer</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.read}</div>
                  <div className="text-sm text-gray-600">Leídos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
                  <div className="text-sm text-gray-600">Respondidos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-gray-500">{stats.archived}</div>
                  <div className="text-sm text-gray-600">Archivados</div>
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
                        placeholder="Buscar mensajes..."
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
                      variant={statusFilter === "unread" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("unread")}
                    >
                      Sin Leer
                    </Button>
                    <Button
                      variant={statusFilter === "read" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("read")}
                    >
                      Leídos
                    </Button>
                    <Button
                      variant={statusFilter === "archived" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("archived")}
                    >
                      Archivados
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages Table */}
            <Card>
              <CardHeader>
                <CardTitle>Bandeja de Mensajes</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-full">
                  <Table>
                    <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Remitente</TableHead>
                      <TableHead className="min-w-[150px]">Asunto</TableHead>
                      <TableHead className="min-w-[200px]">Mensaje</TableHead>
                      <TableHead className="min-w-[120px]">Estado</TableHead>
                      <TableHead className="min-w-[100px]">Fecha</TableHead>
                      <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow key={message.id} className={!message.isRead ? "bg-blue-50" : ""}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{message.name}</div>
                            <div className="text-sm text-gray-500">{message.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">
                            {message.subject || "Sin asunto"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md truncate">{message.message}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {message.isArchived && (
                              <Badge variant="outline" className="text-xs">Archivado</Badge>
                            )}
                            {message.isReplied && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">Respondido</Badge>
                            )}
                            {!message.isRead ? (
                              <Badge variant="default" className="text-xs">Nuevo</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Leído</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(message.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => markAsRead(message)}>
                                {message.isRead ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Marcar como no leído
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Marcar como leído
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedMessage(message);
                                setReplyContent("");
                              }}>
                                <Reply className="mr-2 h-4 w-4" />
                                Responder
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleArchive(message)}>
                                {message.isArchived ? (
                                  <>
                                    <ArchiveRestore className="mr-2 h-4 w-4" />
                                    Recuperar de archivo
                                  </>
                                ) : (
                                  <>
                                    <Archive className="mr-2 h-4 w-4" />
                                    Archivar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteMessageMutation.mutate(message.id)}
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

                {filteredMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== "all"
                      ? "No se encontraron mensajes con los filtros aplicados"
                      : "No hay mensajes registrados"
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>
                  Configura la información de contacto que aparece en tu sitio web
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contact Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-phone">Teléfono</Label>
                      <Input
                        id="contact-phone"
                        value={contactFormData.phone}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={contactFormData.email}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contacto@empresa.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contact-address">Dirección</Label>
                    <Input
                      id="contact-address"
                      value={contactFormData.address}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, Ciudad, Estado 12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-hours">Horarios</Label>
                    <Input
                      id="contact-hours"
                      value={contactFormData.hours}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, hours: e.target.value }))}
                      placeholder="Lunes-Viernes 9:00-18:00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-maps">URL de Google Maps</Label>
                    <Input
                      id="contact-maps"
                      value={contactFormData.mapsUrl}
                      onChange={(e) => setContactFormData(prev => ({ ...prev, mapsUrl: e.target.value }))}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Redes Sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact-facebook">Facebook</Label>
                      <Input
                        id="contact-facebook"
                        value={contactFormData.facebook}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, facebook: e.target.value }))}
                        placeholder="https://facebook.com/empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-instagram">Instagram</Label>
                      <Input
                        id="contact-instagram"
                        value={contactFormData.instagram}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="https://instagram.com/empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-twitter">Twitter/X</Label>
                      <Input
                        id="contact-twitter"
                        value={contactFormData.twitter}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, twitter: e.target.value }))}
                        placeholder="https://twitter.com/empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-linkedin">LinkedIn</Label>
                      <Input
                        id="contact-linkedin"
                        value={contactFormData.linkedin}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="https://linkedin.com/company/empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-youtube">YouTube</Label>
                      <Input
                        id="contact-youtube"
                        value={contactFormData.youtube}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, youtube: e.target.value }))}
                        placeholder="https://youtube.com/@empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-tiktok">TikTok</Label>
                      <Input
                        id="contact-tiktok"
                        value={contactFormData.tiktok}
                        onChange={(e) => setContactFormData(prev => ({ ...prev, tiktok: e.target.value }))}
                        placeholder="https://tiktok.com/@empresa"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => updateContactInfoMutation.mutate(contactFormData)}
                    disabled={updateContactInfoMutation.isPending}
                  >
                    {updateContactInfoMutation.isPending ? "Guardando..." : "Guardar Información"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {MessageReplyDialog}
      </div>
    </AdminLayout>
  );
}

export default AdminContact;
