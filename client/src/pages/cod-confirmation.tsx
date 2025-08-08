import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Banknote, MapPin, Phone } from "lucide-react";

export default function CODConfirmation() {
  const [, setLocation] = useLocation();
  const [orderData, setOrderData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get order data from sessionStorage
    const storedData = sessionStorage.getItem('paymentOrderData');
    if (!storedData) {
      toast({
        title: "Error",
        description: "No order data found. Please start checkout again.",
        variant: "destructive",
      });
      setLocation('/checkout');
      return;
    }

    const data = JSON.parse(storedData);
    setOrderData(data);
  }, [setLocation, toast]);

  const confirmCODMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", "/api/payment/confirm-cod", { orderId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Clear order data
        sessionStorage.removeItem('paymentOrderData');
        // Navigate to success page
        setLocation(`/payment-success?orderId=${orderData.orderId}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to confirm COD order. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleConfirmCOD = () => {
    if (orderData?.orderId) {
      confirmCODMutation.mutate(orderData.orderId);
    }
  };

  const goBackToCheckout = () => {
    setLocation('/checkout');
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading order data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Cash on Delivery</h1>
            <div className="flex items-center space-x-2">
              <Banknote className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-gray-600">COD Order</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Banknote className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cash on Delivery
              </h2>
              <p className="text-gray-600">
                Your order will be confirmed and you can pay when it's delivered to your address.
              </p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{orderData.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="text-gray-900">₹{orderData.tax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">COD Fee</span>
                  <span className="text-gray-900">₹20</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-lg font-semibold text-gray-900">₹{orderData.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> A small COD fee of ₹20 is applied for cash on delivery orders to cover handling charges.
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            {orderData.billingAddress && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
                </div>
                <div className="text-gray-700">
                  <p className="font-medium">
                    {orderData.billingAddress.firstName} {orderData.billingAddress.lastName}
                  </p>
                  <p>{orderData.billingAddress.address}</p>
                  <p>{orderData.billingAddress.city} - {orderData.billingAddress.pincode}</p>
                </div>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Delivery Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Our delivery partner will contact you before delivery</li>
                    <li>• Please keep the exact amount ready for payment</li>
                    <li>• Delivery usually takes 3-5 business days</li>
                    <li>• You can track your order status after confirmation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleConfirmCOD}
                disabled={confirmCODMutation.isPending}
                className="w-full bg-amber-500 text-white hover:bg-amber-600 h-12"
              >
                {confirmCODMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Confirming Order...
                  </>
                ) : (
                  "Confirm COD Order"
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={goBackToCheckout}
                className="w-full h-12"
              >
                Back to Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}