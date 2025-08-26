import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
// Note: Header and Footer components would be imported from the appropriate location

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);
  const { toast } = useToast();

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/store/orders/track", orderNumber, searchEmail],
    queryFn: async () => {
      if (!orderNumber.trim()) return null;
      
      const params = new URLSearchParams({
        orderNumber: orderNumber.trim(),
        ...(searchEmail.trim() && { email: searchEmail.trim() })
      });
      
      return apiRequest(`/api/store/orders/track?${params}`);
    },
    enabled: searchAttempted && !!orderNumber.trim(),
    retry: false
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast({
        title: "Error",
        description: "Ingresa un número de pedido",
        variant: "destructive"
      });
      return;
    }
    
    setSearchAttempted(true);
    refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'confirmed':
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
      case 'refunded':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado',
      'refunded': 'Reembolsado'
    };
    
    return labels[status] || status;
  };

  const formatPrice = (price: number, currency = 'MXN') => {
    return (price / 100).toLocaleString('es-MX', {
      style: 'currency',
      currency: currency
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Search className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-3xl font-bold mb-2">Rastrear Pedido</h1>
          <p className="text-muted-foreground">
            Ingresa tu número de pedido para ver el estado de tu compra
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buscar Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Número de Pedido *</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Ej: ORD-1234567890"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (Opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                />
                <p className="text-sm text-muted-foreground">
                  Si proporcionas tu email, podrás ver más detalles del pedido
                </p>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Buscando..." : "Buscar Pedido"}
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchAttempted && (
          <>
            {error && (
              <Card className="mb-8 border-red-200">
                <CardContent className="pt-6">
                  <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Pedido no encontrado</h3>
                    <p>
                      No se encontró un pedido con el número proporcionado. 
                      Verifica que el número sea correcto.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {order && (
              <div className="space-y-6">
                {/* Order Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      Pedido {order.orderNumber}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={getStatusColor(order.status)} className="mt-1">
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha del Pedido</p>
                        <p className="font-medium">{formatDate(order.createdAt)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-bold text-lg">{formatPrice(order.total, order.currency)}</p>
                      </div>
                    </div>
                    
                    {order.trackingNumber && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          <strong>Número de Rastreo:</strong> {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Productos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.productName}</h4>
                              {item.variantName && (
                                <p className="text-sm text-muted-foreground">
                                  Variante: {item.variantName}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {formatPrice(item.totalPrice)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.unitPrice)} c/u
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dirección de Envío</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {typeof order.shippingAddress === 'string' ? (
                          <p>{order.shippingAddress}</p>
                        ) : (
                          <>
                            <p><strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong></p>
                            <p>{order.shippingAddress.address1}</p>
                            {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && <p>Tel: {order.shippingAddress.phone}</p>}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}