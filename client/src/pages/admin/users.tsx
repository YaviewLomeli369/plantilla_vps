import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  UserCheck,
  UserX,
  Crown,
  Shield,
  User,
  Users
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editFormData, setEditFormData] = useState({ role: "", isActive: true });
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    refetchOnMount: true,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserType> }) => {
      return await apiRequest(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({ title: "Usuario actualizado correctamente" });
    },
    onError: (error) => {
      toast({ 
        title: "Error al actualizar usuario", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const stats = {
    total: users?.length || 0,
    superuser: users?.filter(u => u.role === "superuser").length || 0,
    admin: users?.filter(u => u.role === "admin").length || 0,
    staff: users?.filter(u => u.role === "staff").length || 0,
    cliente: users?.filter(u => u.role === "cliente").length || 0,
    active: users?.filter(u => u.isActive).length || 0,
    inactive: users?.filter(u => !u.isActive).length || 0,
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superuser":
        return <Crown className="h-4 w-4 text-error" />;
      case "admin":
        return <Shield className="h-4 w-4 text-primary" />;
      case "staff":
        return <Users className="h-4 w-4 text-secondary" />;
      default:
        return <User className="h-4 w-4 text-success" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superuser":
        return "destructive";
      case "admin":
        return "default";
      case "staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setEditFormData({
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      data: editFormData,
    });
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUserMutation.mutate({
      id: userId,
      data: { isActive: !currentStatus },
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra los usuarios y sus permisos</p>
          </div>
          {/* <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-error">{stats.superuser}</div>
              <div className="text-xs text-gray-600">Superuser</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-primary">{stats.admin}</div>
              <div className="text-xs text-gray-600">Admins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-secondary">{stats.staff}</div>
              <div className="text-xs text-gray-600">Staff</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-success">{stats.cliente}</div>
              <div className="text-xs text-gray-600">Clientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-success">{stats.active}</div>
              <div className="text-xs text-gray-600">Activos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold text-warning">{stats.inactive}</div>
              <div className="text-xs text-gray-600">Inactivos</div>
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
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="superuser">Superuser</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
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
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Activos
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                >
                  Inactivos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Usuario</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Rol</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium">{user.username}</span>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">Tú</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role) as any} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="default" className="bg-success text-white">
                          <UserCheck className="mr-1 h-3 w-3" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <UserX className="mr-1 h-3 w-3" />
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(currentUser?.role === "superuser" || 
                            (currentUser?.role === "admin" && user.role !== "superuser" && user.role !== "admin")) && (
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {user.role !== "superuser" && user.id !== currentUser?.id && (
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
                </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "No se encontraron usuarios con los filtros aplicados"
                  : "No hay usuarios registrados"
                }
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
              <DialogDescription>
                Modifica el rol y estado del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={editFormData.role} onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {currentUser?.role === "superuser" && (
                      <SelectItem value="superuser">Superuser</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Usuario activo</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
