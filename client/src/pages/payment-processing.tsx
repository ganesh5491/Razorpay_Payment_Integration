import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CreditCard, Smartphone } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentProcessing() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get payment data from sessionStorage
    const storedData = sessionStorage.getItem('paymentOrderData');
    if (!storedData) {
      toast({
        title: "Error",
        description: "No payment data found. Please start checkout again.",
        variant: "destructive",
      });
      setLocation('/checkout');
      return;
    }

    const data = JSON.parse(storedData);
    setPaymentData(data);
    
    // Auto-initiate payment after component mounts
    if (data.razorpayOrder) {
      setTimeout(() => {
        openRazorpayCheckout(data.razorpayOrder, data.orderId, data.billingAddress);
      }, 1000);
    }
  }, [setLocation, toast]);

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payment/verify", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Clear payment data
        sessionStorage.removeItem('paymentOrderData');
        // Navigate to success page
        setLocation(`/payment-success?orderId=${paymentData.orderId}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Payment verification failed. Please try again.",
        variant: "destructive",
      });
    }
  });

  const openRazorpayCheckout = (razorpayOrder: any, orderId: string, billingAddress: any) => {
    setIsProcessing(false);
    
    const options = {
      key: razorpayOrder.key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Payment Integration",
      description: "Secure Payment Transaction",
      order_id: razorpayOrder.id,
      handler: function (response: any) {
        verifyPaymentMutation.mutate({
          orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          razorpayOrderId: razorpayOrder.id,
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
      modal: {
        ondismiss: function() {
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment process.",
            variant: "destructive",
          });
          setLocation('/checkout');
        }
      }
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
      setLocation('/checkout');
    }
  };

  const handleRetryPayment = () => {
    if (paymentData?.razorpayOrder) {
      openRazorpayCheckout(paymentData.razorpayOrder, paymentData.orderId, paymentData.billingAddress);
    }
  };

  const goBackToCheckout = () => {
    setLocation('/checkout');
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p>Loading payment data...</p>
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
            <h1 className="text-xl font-semibold text-gray-900">Payment Processing</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Secure Payment</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-8 text-center">
            {isProcessing ? (
              <>
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Initializing Payment
                </h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we set up your secure payment gateway...
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  {paymentData.paymentMethod === 'upi' ? (
                    <Smartphone className="h-10 w-10 text-white" />
                  ) : (
                    <CreditCard className="h-10 w-10 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {paymentData.paymentMethod === 'upi' ? 'UPI Payment' : 'Card Payment'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {paymentData.paymentMethod === 'upi' 
                    ? 'Complete your payment using any UPI app'
                    : 'Complete your payment using your credit or debit card'
                  }
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-lg font-semibold text-gray-900">
                    Amount to Pay: ₹{paymentData.total?.toLocaleString()}
                  </p>
                </div>
              </>
            )}

            {!isProcessing && (
              <div className="space-y-3">
                <Button 
                  onClick={handleRetryPayment}
                  disabled={verifyPaymentMutation.isPending}
                  className="w-full bg-primary text-white hover:bg-blue-700"
                >
                  {verifyPaymentMutation.isPending ? "Processing..." : "Open Payment Gateway"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={goBackToCheckout}
                  className="w-full"
                >
                  Back to Checkout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}