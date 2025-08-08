import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "card" | "cod" | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddressData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCODModal, setShowCODModal] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
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
        setOrderId(data.orderId);
        
        if (selectedPaymentMethod === "cod") {
          setShowCODModal(true);
        } else if (data.razorpayOrder) {
          openRazorpayCheckout(data.razorpayOrder, data.orderId);
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

  const confirmCODMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiRequest("POST", "/api/payment/confirm-cod", { orderId });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowCODModal(false);
        setShowSuccessModal(true);
      }
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payment/verify", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setShowSuccessModal(true);
      }
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

  const openRazorpayCheckout = (razorpayOrder: any, orderId: string) => {
    const options = {
      key: razorpayOrder.key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Payment Integration",
      description: "Test Transaction",
      order_id: razorpayOrder.id,
      handler: function (response: any) {
        verifyPaymentMutation.mutate({
          orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      prefill: {
        name: `${billingAddress.firstName} ${billingAddress.lastName}`,
        email: "customer@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3B82F6",
      },
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      toast({
        title: "Error",
        description: "Payment gateway not available. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmCOD = () => {
    confirmCODMutation.mutate(orderId);
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

      {/* COD Confirmation Modal */}
      {showCODModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-money-bill-wave text-white text-2xl"></i>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Cash on Delivery</h4>
              <p className="text-gray-600 mb-4">Your order will be confirmed and you can pay when it's delivered to your address.</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">₹{total.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-6">(Including ₹20 COD fee)</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleConfirmCOD}
                  disabled={confirmCODMutation.isPending}
                  className="w-full bg-amber-500 text-white hover:bg-amber-600"
                >
                  {confirmCODMutation.isPending ? "Confirming..." : "Confirm Order"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCODModal(false)}
                  className="w-full"
                >
                  Back to Payment Options
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Order Confirmed!</h4>
              <p className="text-gray-600 mb-4">Thank you for your purchase. Your order has been successfully placed.</p>
              <p className="text-sm text-gray-500 mb-6">Order ID: <span className="font-medium">#{orderId}</span></p>
              
              <div className="space-y-3">
                <Button className="w-full">
                  Track Order
                </Button>
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
