import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShoppingCart, Heart, Filter, Search, Plus, Minus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig, Product, ProductCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import AnimatedSection from "@/components/AnimatedSection";

export default function Store() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/store/products"],
  });

  const { data: categories } = useQuery<ProductCategory[]>({
    queryKey: ["/api/store/categories"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const product = products?.find(p => p.id === productId);
      if (!product) throw new Error("Producto no encontrado");
      
      setCart(prev => {
        const existing = prev.find(item => item.product.id === productId);
        if (existing) {
          return prev.map(item => 
            item.product.id === productId 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { product, quantity: 1 }];
      });
      
      return product;
    },
    onSuccess: (product) => {
      toast({
        title: "Producto agregado",
        description: `${product.name} fue agregado al carrito.`,
      });
    },
  });

  const configData = config?.config as any;
  const modules = configData?.frontpage?.modulos || {};
  const isStoreEnabled = modules.tienda?.activo;

  // Helper functions
  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const getCategoryName = (categoryId: string) => {
    if (categoryId === "all") return "Todas las categorías";
    return categories?.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const availableCategories = ["all", ...(categories?.map(cat => cat.id) || [])];
  
  const filteredProducts = products?.filter(p => {
    if (!p.isActive) return false;
    
    const matchesCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
    const matchesSearch = searchTerm === "" || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  }) || [];

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setLocation("/checkout");
  };

  if (!isStoreEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AnimatedSection>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Tienda</h1>
            <p className="text-xl text-muted-foreground">
              La tienda no está disponible en este momento.
            </p>
          </div>
        </AnimatedSection>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AnimatedSection>
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p>Cargando productos...</p>
            </div>
          </div>
        </AnimatedSection>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Tienda Online - Nuestros Productos"
        description="Descubre nuestros productos de alta calidad. Entrega rápida y segura."
      />
      <Navbar />

      <AnimatedSection>
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Nuestra Tienda</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubre nuestros productos de alta calidad con entrega rápida y segura
            </p>
          </div>

          {/* Filters and Cart */}
          <AnimatedSection delay={0.2}>
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="sm:w-64">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.filter(cat => cat !== "all").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cart Button */}
              <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogTrigger asChild>
                  <Button className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Carrito de Compras</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Tu carrito está vacío
                      </p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex items-center justify-between p-4 border rounded">
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${item.product.price} x {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">Total:</span>
                            <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
                          </div>
                          <Button className="w-full" onClick={handleCheckout}>
                            Proceder al Checkout
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </AnimatedSection>

          {/* Products Grid */}
          <AnimatedSection delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <AnimatedSection key={product.id} delay={0.1 * (index % 8)}>
                  <Card className="h-full overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="relative">
                      {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {product.stock !== null && product.stock <= 5 && product.stock > 0 && (
                        <Badge variant="destructive" className="absolute top-2 right-2">
                          ¡Pocas unidades!
                        </Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge variant="secondary" className="absolute top-2 right-2">
                          Agotado
                        </Badge>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                        <Button variant="ghost" size="sm" className="shrink-0 p-1">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      {product.categoryId && (
                        <Badge variant="outline" className="w-fit">
                          {product.categoryId}
                        </Badge>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col">
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.stock !== null && product.stock !== undefined && product.stock > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {product.stock} disponibles
                            </span>
                          )}
                        </div>

                        <Button
                          onClick={() => addToCartMutation.mutate(product.id)}
                          disabled={(product.stock !== null && product.stock === 0) || addToCartMutation.isPending}
                          className="gap-2"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Agregar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>

          {filteredProducts.length === 0 && (
            <AnimatedSection delay={0.2}>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">No hay productos disponibles</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" 
                    ? "No se encontraron productos que coincidan con los filtros."
                    : "Actualmente no tenemos productos en stock."
                  }
                </p>
                {(searchTerm || selectedCategory !== "all") && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </AnimatedSection>
          )}
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}