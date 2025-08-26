import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryMovementSchema } from "@shared/schema";
import type { Product, InventoryMovement, InsertInventoryMovement } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { z } from "zod";

const movementFormSchema = insertInventoryMovementSchema.extend({
  productId: z.string().min(1, "Producto es requerido")
});

type MovementFormData = z.infer<typeof movementFormSchema>;

export default function InventoryPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/store/products"],
  });

  // Fetch inventory movements
  const { data: movements, isLoading: movementsLoading } = useQuery<InventoryMovement[]>({
    queryKey: ["/api/inventory/movements"],
  });

  // Form setup
  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      type: "in",
      quantity: 1,
      reason: "restock",
      notes: ""
    }
  });

  // Create inventory movement mutation
  const createMovement = useMutation({
    mutationFn: async (data: MovementFormData) => {
      return apiRequest("/api/inventory/movements", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Movimiento registrado",
        description: "El movimiento de inventario se ha registrado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/store/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/movements"] });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al registrar el movimiento",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: MovementFormData) => {
    createMovement.mutate(data);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "out": return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "adjustment": return <RotateCcw className="w-4 h-4 text-yellow-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "in": return "success";
      case "out": return "destructive";
      case "adjustment": return "warning";
      default: return "secondary";
    }
  };

  const getStockStatus = (stock: number, lowThreshold: number = 5) => {
    if (stock === 0) return { status: "out", color: "destructive", text: "Sin stock" };
    if (stock <= lowThreshold) return { status: "low", color: "warning", text: "Stock bajo" };
    return { status: "good", color: "success", text: "Stock bueno" };
  };

  const getProductName = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    return product?.name || "Producto no encontrado";
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Gestión de Inventario</h1>
          <p className="text-muted-foreground">
            Administra el stock de productos y registra movimientos de inventario
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Package className="w-4 h-4 mr-2" />
              Nuevo Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Movimiento de Inventario</DialogTitle>
              <DialogDescription>
                Registra entradas, salidas o ajustes de stock de productos
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Producto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un producto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimiento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in">Entrada (+)</SelectItem>
                          <SelectItem value="out">Salida (-)</SelectItem>
                          <SelectItem value="adjustment">Ajuste</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el motivo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="restock">Restock</SelectItem>
                          <SelectItem value="sale">Venta</SelectItem>
                          <SelectItem value="damage">Daño</SelectItem>
                          <SelectItem value="return">Devolución</SelectItem>
                          <SelectItem value="adjustment">Ajuste manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} placeholder="Notas adicionales..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMovement.isPending}>
                    {createMovement.isPending ? "Registrando..." : "Registrar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Estado de Productos</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products?.map((product) => {
              const stockStatus = getStockStatus(product.stock || 0, product.lowStockThreshold || 5);
              return (
                <Card key={product.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <Badge variant={stockStatus.color as any}>
                        {stockStatus.text}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      SKU: {product.sku || "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Stock actual:</span>
                        <span className="text-lg font-bold">{product.stock}</span>
                      </div>
                      
                      {product.lowStockThreshold && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Umbral mínimo:</span>
                          <span>{product.lowStockThreshold}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Precio:</span>
                        <span>{product.currency === 'MXN' ? '$' : product.currency + ' '}{(product.price / 100).toFixed(2)}</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => {
                          form.setValue("productId", product.id);
                          setSelectedProductId(product.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Registrar Movimiento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>
                Registro completo de todos los movimientos de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movementsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : movements && movements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {movement.createdAt ? 
                            formatDistanceToNow(new Date(movement.createdAt), { 
                              addSuffix: true, 
                              locale: es 
                            }) : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          {getProductName(movement.productId || "")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getMovementIcon(movement.type)}
                            <Badge variant={getMovementColor(movement.type) as any}>
                              {movement.type === 'in' ? 'Entrada' : 
                               movement.type === 'out' ? 'Salida' : 'Ajuste'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={movement.type === 'in' ? 'text-green-600' : 
                                         movement.type === 'out' ? 'text-red-600' : 'text-yellow-600'}>
                            {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {movement.reason || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {movement.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay movimientos registrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}