import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShoppingBag, 
  Eye, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  CreditCard,
  Calendar,
  Filter,
  Truck,
  PackageCheck,
  Ban,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shippingAddress: string | null;
  items: any[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/store/orders"],
    queryFn: () => apiRequest("/api/store/orders", { method: "GET" }),
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => 
      apiRequest(`/api/store/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/orders"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido se ha actualizado correctamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive"
      });
    }
  });

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    
    // Fetch order items
    try {
      const items = await apiRequest(`/api/store/orders/${order.id}/items`, { method: "GET" });
      setSelectedItems(items);
    } catch (error) {
      console.error("Error fetching order items:", error);
      setSelectedItems([]);
    }
    
    setShowOrderDetails(true);
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Filter orders
  const filteredOrders = orders.filter((order: Order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) return false;
    return true;
  });

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      pending: orders.filter((o: Order) => o.status === 'pending').length,
      confirmed: orders.filter((o: Order) => o.status === 'confirmed').length,
      processing: orders.filter((o: Order) => o.status === 'processing').length,
      shipped: orders.filter((o: Order) => o.status === 'shipped').length,
      delivered: orders.filter((o: Order) => o.status === 'delivered').length,
      cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
    };
    return counts;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, label: "Pendiente" },
      confirmed: { variant: "default" as const, icon: CheckCircle, label: "Confirmado" },
      processing: { variant: "outline" as const, icon: RefreshCw, label: "Procesando" },
      shipped: { variant: "default" as const, icon: Truck, label: "Enviado" },
      delivered: { variant: "default" as const, icon: PackageCheck, label: "Entregado" },
      cancelled: { variant: "destructive" as const, icon: Ban, label: "Cancelado" },
      refunded: { variant: "outline" as const, icon: XCircle, label: "Reembolsado" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pendiente" },
      paid: { variant: "default" as const, label: "Pagado" },
      failed: { variant: "destructive" as const, label: "Fallido" },
      refunded: { variant: "outline" as const, label: "Reembolsado" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Gestiona todas las órdenes de la tienda
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pedidos Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((order: Order) => order.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {getStatusCounts().pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Procesando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {getStatusCounts().processing}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {getStatusCounts().shipped}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PackageCheck className="w-4 h-4" />
              Entregados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getStatusCounts().delivered}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(orders.filter((order: Order) => order.paymentStatus === 'paid')
                .reduce((sum: number, order: Order) => sum + order.total, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Estado del Pedido</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Estado del Pago</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Lista de Pedidos ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay pedidos</h3>
              <p className="text-muted-foreground">
                Cuando los clientes realicen compras, aparecerán aquí.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Pedido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(order.createdAt), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="processing">Procesando</SelectItem>
                            <SelectItem value="shipped">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Detalles del Pedido {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Fecha del pedido</span>
                  </div>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Método de pago</span>
                  </div>
                  <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Estado del pedido</span>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado del pago</span>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shippingAddress && (
                <div>
                  <h3 className="font-semibold mb-2">Dirección de envío</h3>
                  <div className="text-sm text-muted-foreground">
                    {(() => {
                      try {
                        const address = typeof selectedOrder.shippingAddress === 'string' 
                          ? JSON.parse(selectedOrder.shippingAddress) 
                          : selectedOrder.shippingAddress;
                        return (
                          <div className="space-y-1">
                            <p><strong>{address.firstName} {address.lastName}</strong></p>
                            <p>{address.address1}</p>
                            {address.address2 && <p>{address.address2}</p>}
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                            {address.phone && <p><strong>Tel:</strong> {address.phone}</p>}
                          </div>
                        );
                      } catch (e) {
                        return <p>{selectedOrder.shippingAddress}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Productos del pedido</h3>
                <div className="space-y-3">
                  {selectedItems.map((item: OrderItem) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity} × {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total del pedido</span>
                  <span className="text-xl font-bold">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}