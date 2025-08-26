import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export default function ShippingInfoPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "MX",
    phone: ""
  });

  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "MX",
    phone: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName ||
        !shippingAddress.firstName || !shippingAddress.lastName ||
        !shippingAddress.address1 || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.zipCode) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    // Guardar información en localStorage para usar en checkout
    const checkoutData = {
      customerInfo,
      shippingAddress,
      billingAddress: billingDifferent ? billingAddress : shippingAddress,
      timestamp: Date.now()
    };
    
    localStorage.setItem('checkout-info', JSON.stringify(checkoutData));
    
    // Redirigir a checkout
    setLocation('/checkout');
  };

  const mexicanStates = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
    "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
    "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
    "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/store')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la Tienda
          </Button>
          
          <div className="text-center">
            <Truck className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold mb-2">Información de Envío</h1>
            <p className="text-muted-foreground">
              Proporciona tu información de contacto y dirección de envío
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-firstName">Nombre *</Label>
                  <Input
                    id="customer-firstName"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-lastName">Apellidos *</Label>
                  <Input
                    id="customer-lastName"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer-phone">Teléfono</Label>
                <Input
                  id="customer-phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dirección de Envío */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dirección de Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-firstName">Nombre *</Label>
                  <Input
                    id="shipping-firstName"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-lastName">Apellidos *</Label>
                  <Input
                    id="shipping-lastName"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Dirección *</Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
                  placeholder="Calle y número"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Dirección 2 (Opcional)</Label>
                <Input
                  id="address2"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                  placeholder="Colonia, edificio, piso, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Select value={shippingAddress.state} onValueChange={(value) => setShippingAddress({ ...shippingAddress, state: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {mexicanStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal *</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-phone">Teléfono de contacto</Label>
                <Input
                  id="shipping-phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button type="submit" size="lg" className="w-full md:w-auto">
              Continuar al Pago
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}