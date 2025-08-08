import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector";
import { OrderSummary } from "@/components/payment/order-summary";
import { BillingAddress } from "@/components/payment/billing-address";
import { Lock, ArrowLeft, Check } from "lucide-react";

interface OrderItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface BillingAddressData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  pincode: string;
}

const mockOrderItems: OrderItem[] = [
  {
    name: "Wireless Headphones",
    variant: "Black, Premium",
    quantity: 1,
    price: 2999,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  },
  {
    name: "Laptop Bag",
    variant: "Brown Leather, 15\"",
    quantity: 1,
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  },
];


export default function Checkout() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "card" | "cod" | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddressData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const subtotal = mockOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const codFee = selectedPaymentMethod === "cod" ? 20 : 0;
  const total = subtotal + tax + codFee;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/payment/create-order", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Store payment data in sessionStorage for the payment pages
        const paymentData = {
          orderId: data.orderId,
          total: data.total,
          paymentMethod: selectedPaymentMethod,
          billingAddress,
          subtotal,
          tax,
          razorpayOrder: data.razorpayOrder
        };
        sessionStorage.setItem('paymentOrderData', JSON.stringify(paymentData));
        
        // Redirect based on payment method
        if (selectedPaymentMethod === "cod") {
          setLocation('/cod-confirmation');
        } else if (selectedPaymentMethod === "upi" || selectedPaymentMethod === "card") {
          setLocation('/payment-processing');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create order",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });


  const validateForm = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return false;
    }

    const requiredFields = ["firstName", "lastName", "address", "city", "pincode"];
    for (const field of requiredFields) {
      if (!billingAddress[field as keyof BillingAddressData]) {
        toast({
          title: "Error",
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (billingAddress.pincode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit PIN code",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) return;

    const orderData = {
      paymentMethod: selectedPaymentMethod,
      billingAddress,
      items: mockOrderItems,
      subtotal,
      tax,
    };

    createOrderMutation.mutate(orderData);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Secure Checkout</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">SSL Secured</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center text-green-600">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Cart</span>
            </div>
            <div className="w-16 h-0.5 bg-green-600"></div>
            <div className="flex items-center text-green-600">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                <Check className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div className="w-16 h-0.5 bg-primary"></div>
            <div className="flex items-center text-primary">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">4</div>
              <span className="ml-2 text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Payment Form Section */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
                
                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                />

                <BillingAddress
                  billingAddress={billingAddress}
                  onAddressChange={setBillingAddress}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <OrderSummary
              items={mockOrderItems}
              subtotal={subtotal}
              tax={tax}
              codFee={codFee}
              total={total}
              onPlaceOrder={handlePlaceOrder}
              isLoading={createOrderMutation.isPending}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
