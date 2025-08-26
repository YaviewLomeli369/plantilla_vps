import { useState, useEffect } from "react";
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
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Reservation, ReservationSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [availableSlotsForEdit, setAvailableSlotsForEdit] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newReservation, setNewReservation] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    timeSlot: "",
    notes: "",
    status: "pending" as const
  });
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reservations, isLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
  });

  const { data: reservationSettings } = useQuery<ReservationSettings>({
    queryKey: ["/api/reservation-settings"],
  });

  const { data: slotsData } = useQuery({
    queryKey: ["/api/reservations/available-slots", selectedDate],
    enabled: !!selectedDate,
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await fetch(`/api/reservations/available-slots/${selectedDate}`);
      return response.json();
    }
  });

  useEffect(() => {
    if (slotsData?.availableSlots) {
      setAvailableSlots(slotsData.availableSlots);
    }
  }, [slotsData]);

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: typeof newReservation) => {
      return await apiRequest("/api/reservations", {
        method: "POST",
        body: JSON.stringify(reservationData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      setShowCreateDialog(false);
      setNewReservation({
        name: "",
        email: "",
        phone: "",
        service: "",
        date: "",
        timeSlot: "",
        notes: "",
        status: "pending"
      });
      setSelectedDate("");
      setAvailableSlots([]);
      toast({ title: "Reserva creada correctamente" });
    },
  });

  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Reservation> }) => {
      return await apiRequest(`/api/reservations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      setEditingReservation(null);
      toast({ title: "Reserva actualizada correctamente" });
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/reservations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({ title: "Reserva eliminada correctamente" });
    },
  });

  const filteredReservations = reservations?.filter(reservation => {
    const matchesSearch = reservation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.service?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    
    const today = new Date();
    const reservationDate = new Date(reservation.date);
    let matchesDate = true;
    
    if (dateFilter === "today") {
      matchesDate = reservationDate.toDateString() === today.toDateString();
    } else if (dateFilter === "week") {
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      matchesDate = reservationDate >= today && reservationDate <= weekFromNow;
    } else if (dateFilter === "month") {
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      matchesDate = reservationDate >= today && reservationDate <= monthFromNow;
    }

    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  const stats = {
    total: reservations?.length || 0,
    pending: reservations?.filter(r => r.status === "pending").length || 0,
    confirmed: reservations?.filter(r => r.status === "confirmed").length || 0,
    completed: reservations?.filter(r => r.status === "completed").length || 0,
    cancelled: reservations?.filter(r => r.status === "cancelled").length || 0,
  };

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReservation.name || !newReservation.email || !newReservation.date || !newReservation.timeSlot) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios"
      });
      return;
    }

    createReservationMutation.mutate(newReservation);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setNewReservation(prev => ({ ...prev, date, timeSlot: "" }));
  };

  const handleUpdateStatus = (reservation: Reservation, status: string) => {
    updateReservationMutation.mutate({ 
      id: reservation.id, 
      data: { status } 
    });
  };

  const handleDeleteReservation = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta reserva?")) {
      deleteReservationMutation.mutate(id);
    }
  };

  const fetchAvailableSlotsForEdit = async (date: string) => {
    try {
      const response = await fetch(`/api/reservations/available-slots/${date}`);
      const data = await response.json();
      setAvailableSlotsForEdit(data.availableSlots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlotsForEdit([]);
    }
  };

  const handleEditDateChange = (date: string) => {
    if (editingReservation) {
      setEditingReservation({...editingReservation, date: date as any});
      fetchAvailableSlotsForEdit(date);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h1>
            <p className="text-gray-600 mt-1">Administra las citas y reservas de servicios</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Reserva
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar reservas..."
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
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas ({filteredReservations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.name}</div>
                        <div className="text-sm text-gray-500">{reservation.email}</div>
                        {reservation.phone && (
                          <div className="text-sm text-gray-500">{reservation.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{reservation.service}</TableCell>
                    <TableCell>{typeof reservation.date === 'string' ? formatDate(reservation.date) : ''}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{reservation.timeSlot || ''}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(reservation.status) as any} className="flex items-center space-x-1">
                        {getStatusIcon(reservation.status || "pending")}
                        <span className="capitalize">{reservation.status}</span>
                      </Badge>
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
                            onClick={() => handleUpdateStatus(reservation, "confirmed")}
                            disabled={reservation.status === "confirmed"}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(reservation, "completed")}
                            disabled={reservation.status === "completed"}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(reservation, "cancelled")}
                            disabled={reservation.status === "cancelled"}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingReservation(reservation);
                              // Load available slots for the reservation date
                              if (reservation.date) {
                                const dateString = typeof reservation.date === 'string' 
                                  ? reservation.date 
                                  : reservation.date.toISOString().split('T')[0];
                                fetchAvailableSlotsForEdit(dateString);
                              }
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteReservation(reservation.id)}
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

        {/* Create Reservation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nueva Reserva</DialogTitle>
              <DialogDescription>
                Crea una nueva reserva de servicio
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Cliente *</Label>
                  <Input
                    id="name"
                    value={newReservation.name}
                    onChange={(e) => setNewReservation({...newReservation, name: e.target.value})}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email del Cliente *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newReservation.email}
                    onChange={(e) => setNewReservation({...newReservation, email: e.target.value})}
                    placeholder="cliente@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newReservation.phone}
                    onChange={(e) => setNewReservation({...newReservation, phone: e.target.value})}
                    placeholder="+52 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Tipo de servicio</Label>
                  <Select 
                    value={newReservation.service} 
                    onValueChange={(value) => setNewReservation({...newReservation, service: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {(reservationSettings?.allowedServices as string[] || []).map((service: string) => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => {
                      const maxDays = reservationSettings?.maxAdvanceDays || 30;
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + maxDays);
                      return maxDate.toISOString().split('T')[0];
                    })()}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Hora disponible *</Label>
                  <Select 
                    value={newReservation.timeSlot} 
                    onValueChange={(value) => setNewReservation({...newReservation, timeSlot: value})}
                    disabled={!selectedDate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedDate ? "Seleccione una hora" : "Primero seleccione una fecha"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {slot}
                            </div>
                          </SelectItem>
                        ))
                      ) : selectedDate ? (
                        <SelectItem value="no-slots" disabled>No hay horarios disponibles</SelectItem>
                      ) : null}
                    </SelectContent>
                  </Select>
                  {selectedDate && availableSlots.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No hay horarios disponibles para esta fecha.
                    </p>
                  )}
                  {selectedDate && availableSlots.length > 0 && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {availableSlots.length} horarios disponibles
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>
            </form>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                onClick={handleCreateReservation} 
                disabled={createReservationMutation.isPending || !newReservation.timeSlot}
              >
                {createReservationMutation.isPending ? "Creando..." : "Crear Reserva"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Reservation Dialog */}
        <Dialog open={!!editingReservation} onOpenChange={() => setEditingReservation(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Reserva</DialogTitle>
              <DialogDescription>
                Modifica los detalles de la reserva
              </DialogDescription>
            </DialogHeader>
            
            {editingReservation && (
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre del Cliente *</Label>
                    <Input
                      id="edit-name"
                      value={editingReservation.name}
                      onChange={(e) => setEditingReservation({...editingReservation, name: e.target.value})}
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email del Cliente *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingReservation.email}
                      onChange={(e) => setEditingReservation({...editingReservation, email: e.target.value})}
                      placeholder="cliente@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={editingReservation.phone || ""}
                      onChange={(e) => setEditingReservation({...editingReservation, phone: e.target.value})}
                      placeholder="Número de teléfono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-service">Servicio *</Label>
                    <Select 
                      value={editingReservation.service || ""} 
                      onValueChange={(value) => setEditingReservation({...editingReservation, service: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {(reservationSettings?.allowedServices as string[] || []).map((service: string) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Fecha *</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={typeof editingReservation.date === 'string' ? editingReservation.date : editingReservation.date?.toISOString().split('T')[0] || ""}
                      onChange={(e) => handleEditDateChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-timeSlot">Horario *</Label>
                    <Select 
                      value={editingReservation.timeSlot || ""} 
                      onValueChange={(value) => setEditingReservation({...editingReservation, timeSlot: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un horario" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Include current slot even if not in available slots */}
                        {editingReservation.timeSlot && !availableSlotsForEdit.includes(editingReservation.timeSlot) && (
                          <SelectItem value={editingReservation.timeSlot}>
                            {editingReservation.timeSlot} (actual)
                          </SelectItem>
                        )}
                        {availableSlotsForEdit.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {slot}
                            </div>
                          </SelectItem>
                        ))}
                        {availableSlotsForEdit.length === 0 && !editingReservation.timeSlot && (
                          <SelectItem value="no-slots" disabled>No hay horarios disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select 
                    value={editingReservation.status || ""} 
                    onValueChange={(value) => setEditingReservation({...editingReservation, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notas adicionales</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingReservation.notes || ""}
                    onChange={(e) => setEditingReservation({...editingReservation, notes: e.target.value})}
                    placeholder="Notas adicionales..."
                    rows={3}
                  />
                </div>
              </form>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingReservation(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (editingReservation) {
                    // Clean data for update - remove read-only fields
                    const { id, createdAt, updatedAt, userId, ...cleanData } = editingReservation;
                    updateReservationMutation.mutate({
                      id: editingReservation.id,
                      data: cleanData
                    });
                  }
                }}
                disabled={updateReservationMutation.isPending}
              >
                {updateReservationMutation.isPending ? "Actualizando..." : "Actualizar Reserva"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}