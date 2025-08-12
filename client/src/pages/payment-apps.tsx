import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PaymentAppsSelector } from "@/components/payment/payment-apps-selector";
import { useToast } from "@/hooks/use-toast";

export default function PaymentApps() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
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
  }, [setLocation, toast]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return <PaymentAppsSelector paymentData={paymentData} />;
}