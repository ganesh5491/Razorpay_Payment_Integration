import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { PaymentMethodSelector } from "@/components/payment/payment-method-selector";
import { BillingAddress } from "@/components/payment/billing-address";
import { Lock, ArrowLeft, Check, Package } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
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

export default function Shipping() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"upi" | "qr" | "card" | "cod" | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddressData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get items from either direct purchase or cart
    const directPurchaseData = sessionStorage.getItem('directPurchaseItems');
    if (directPurchaseData) {
      const data = JSON.parse(directPurchaseData);
      setOrderItems(data.items);
    } else {
      // Fallback to cart if no direct purchase
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const cart = JSON.parse(cartData);
        setOrderItems(cart);
      } else {
        // No items found, redirect to products
        toast({
          title: "No Items",
          description: "Please add items to cart or select a product first.",
          variant: "destructive",
        });
        setLocation('/');
        return;
      }
    }
  }, [setLocation, toast]);

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        
        // Clear the items data since order is created
        sessionStorage.removeItem('directPurchaseItems');
        if (sessionStorage.getItem('directPurchaseItems')) {
          localStorage.removeItem('cart'); // Clear cart if it was used
        }
        
        // Redirect based on payment method
        if (selectedPaymentMethod === "cod") {
          setLocation('/cod-confirmation');
        } else if (selectedPaymentMethod === "upi") {
          setLocation('/upi-payment');
        } else if (selectedPaymentMethod === "qr") {
          setLocation('/qr-payment');
        } else if (selectedPaymentMethod === "card") {
          setLocation('/cardPayment');
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
      items: orderItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl
      })),
      subtotal,
      tax,
    };

    createOrderMutation.mutate(orderData);
  };

  const goBack = () => {
    // Check if coming from direct purchase or cart
    const directPurchaseData = sessionStorage.getItem('directPurchaseItems');
    if (directPurchaseData) {
      setLocation('/');
    } else {
      setLocation('/cart');
    }
  };

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-4 text-primary" />
            <p>Loading order items...</p>
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
            <div className="flex items-center space-x-4">
              <button onClick={goBack} className="lg:hidden text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Shipping & Payment</h1>
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
            <div className="w-16 h-0.5 bg-primary"></div>
            <div className="flex items-center text-primary">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
              <span className="ml-2 text-sm font-medium">Shipping</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">3</div>
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
          {/* Shipping Form Section */}
          <div className="lg:col-span-7">
            <Card className="shadow-sm border-gray-200 mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h2>
                <BillingAddress
                  billingAddress={billingAddress}
                  onAddressChange={setBillingAddress}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Section */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="text-gray-900">₹{tax}</span>
                  </div>
                  {codFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Fee</span>
                      <span className="text-gray-900">₹{codFee}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-gray-900">₹{total}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                  className="w-full mt-6 bg-primary text-white hover:bg-blue-700 h-12"
                >
                  {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>

                <Button 
                  variant="outline"
                  onClick={goBack}
                  className="w-full mt-3 h-12"
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}