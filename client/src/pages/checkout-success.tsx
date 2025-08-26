import { CheckCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function CheckoutSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const paymentIntentId = searchParams.get("payment_intent");
  const orderNumber = `ORD-${Date.now()}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu pedido ha sido procesado correctamente
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Detalles del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Número de pedido:</span>
              <span className="font-mono text-sm">{orderNumber}</span>
            </div>
            {paymentIntentId && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ID de transacción:</span>
                <span className="font-mono text-sm">{paymentIntentId}</span>
              </div>
            )}
            <div className="border-t pt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  ¿Qué sigue?
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Recibirás un email de confirmación</li>
                  <li>• Tu pedido será procesado en 1-2 días hábiles</li>
                  <li>• Te notificaremos cuando sea enviado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          <Link href="/store">
            <Button className="w-full sm:w-auto">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continuar comprando
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}