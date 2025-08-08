import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Truck, CreditCard } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    // Get order ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, []);

  const handleTrackOrder = () => {
    // In a real app, setLocation to order tracking page
    setLocation('/checkout');
  };

  const handleContinueShopping = () => {
    setLocation('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">Order Confirmation</h1>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Order Confirmed</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="text-xl font-mono font-semibold text-gray-900">#{orderId}</p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">What happens next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">Payment Confirmed</h4>
                  <p className="text-sm text-blue-700">Your payment has been processed successfully</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">Order Processing</h4>
                  <p className="text-sm text-blue-700">We're preparing your items for shipment</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">On the Way</h4>
                  <p className="text-sm text-blue-700">Your order will be delivered in 3-5 days</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleTrackOrder}
                className="w-full bg-primary text-white hover:bg-blue-700 h-12"
              >
                Track Your Order
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleContinueShopping}
                className="w-full h-12"
              >
                Continue Shopping
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                You will receive an email confirmation with tracking details shortly.
                For any questions, contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}