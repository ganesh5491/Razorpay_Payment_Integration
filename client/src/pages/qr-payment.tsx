
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, QrCode, ArrowLeft, Smartphone, CheckCircle, Timer } from "lucide-react";
import QRCodeLib from 'qrcode';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function QRPayment() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "completed">("pending");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const { toast } = useToast();

  // Replace with your actual UPI ID
  const MERCHANT_UPI_ID = "ganeshrk123@ibl";

  useEffect(() => {
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
    generateQRCode(data);
  }, [setLocation, toast]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === "pending") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      toast({
        title: "Session Expired",
        description: "Payment session has expired. Please try again.",
        variant: "destructive",
      });
      setLocation('/checkout');
    }
  }, [timeLeft, paymentStatus, toast, setLocation]);

  const generateQRCode = async (data: any) => {
    try {
      setIsProcessing(true);
      const amount = data.total;
      const transactionNote = `Payment for Order ${data.orderId}`;
      
      // Create UPI payment URL with your merchant UPI ID
      const upiUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=Your%20Store&am=${amount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;
      
      // Generate QR code
      const qrDataUrl = await QRCodeLib.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrDataUrl);
      setIsProcessing(false);
      
      // Start checking payment status
      startPaymentStatusCheck(data.orderId);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startPaymentStatusCheck = (orderId: string) => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await apiRequest("GET", `/api/orders/${orderId}/status`);
        const result = await response.json();
        
        if (result.success && result.order.paymentStatus === "completed") {
          setPaymentStatus("completed");
          clearInterval(checkInterval);
          
          toast({
            title: "Payment Successful!",
            description: "Your payment has been completed successfully.",
          });
          
          setTimeout(() => {
            sessionStorage.removeItem('paymentOrderData');
            setLocation(`/payment-success?orderId=${orderId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 3000); // Check every 3 seconds

    // Clear interval after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 300000);
  };

  const verifyPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payment/verify", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setPaymentStatus("completed");
        sessionStorage.removeItem('paymentOrderData');
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

  const handleRetryPayment = () => {
    if (paymentData) {
      generateQRCode(paymentData);
      setTimeLeft(300); // Reset timer
      setPaymentStatus("pending");
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={goBackToCheckout} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">QR Code Payment</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">QR Payment</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-8 text-center">
            {isProcessing ? (
              <>
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-10 w-10 text-white animate-spin" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Generating QR Code
                </h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we generate your payment QR code...
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <QrCode className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Pay via UPI QR Code
                </h2>
                <p className="text-gray-600 mb-6">
                  Scan the QR code to pay ₹{paymentData.total?.toLocaleString()} to our UPI ID
                </p>
                
                <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                  <p className="text-lg font-semibold text-gray-900">
                    Amount: ₹{paymentData.total?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Merchant UPI ID: {MERCHANT_UPI_ID}
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm mb-6">
                  <img 
                    src={qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>

                {/* Payment Status */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    {paymentStatus === "pending" && (
                      <>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-700">Waiting for payment...</span>
                      </>
                    )}
                    {paymentStatus === "processing" && (
                      <>
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                        <span className="text-sm text-gray-700">Processing payment...</span>
                      </>
                    )}
                    {paymentStatus === "completed" && (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700">Payment successful!</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Timer className="h-4 w-4 mr-1" />
                    <span>Session expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    How to Pay with QR Code
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs mr-3 mt-0.5">1</div>
                      <div>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs mr-3 mt-0.5">2</div>
                      <div>Tap on "Scan QR Code" in your app</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs mr-3 mt-0.5">3</div>
                      <div>Point your camera at the QR code above</div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs mr-3 mt-0.5">4</div>
                      <div>Confirm the amount and complete payment</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleRetryPayment}
                disabled={paymentStatus === "completed" || isProcessing}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isProcessing ? "Generating..." : "Refresh QR Code"}
              </Button>
              <Button 
                variant="outline" 
                onClick={goBackToCheckout}
                className="w-full"
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