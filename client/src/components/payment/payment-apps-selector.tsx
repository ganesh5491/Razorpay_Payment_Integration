import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiGooglepay, SiPaytm, SiAmazonpay } from "react-icons/si";

interface PaymentApp {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  deepLink: (amount: number, orderId: string) => string;
}

const paymentApps: PaymentApp[] = [
  {
    id: "phonepe",
    name: "PhonePe",
    icon: ({ className }) => (
      <div className={`${className} bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-sm`}>
        PhonePe
      </div>
    ),
    bgColor: "bg-purple-50 hover:bg-purple-100",
    textColor: "text-purple-700",
    deepLink: (amount: number, orderId: string) => 
      `phonepe://pay?pa=merchant@upi&pn=YourStore&am=${amount}&tn=Order ${orderId}&cu=INR`
  },
  {
    id: "googlepay",
    name: "Google Pay",
    icon: SiGooglepay,
    bgColor: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-700",
    deepLink: (amount: number, orderId: string) => 
      `gpay://upi/pay?pa=merchant@upi&pn=YourStore&am=${amount}&tn=Order ${orderId}&cu=INR`
  },
  {
    id: "paytm",
    name: "Paytm",
    icon: SiPaytm,
    bgColor: "bg-blue-50 hover:bg-blue-100",
    textColor: "text-blue-700",
    deepLink: (amount: number, orderId: string) => 
      `paytmmp://pay?pa=merchant@upi&pn=YourStore&am=${amount}&tn=Order ${orderId}&cu=INR`
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    icon: SiAmazonpay,
    bgColor: "bg-orange-50 hover:bg-orange-100",
    textColor: "text-orange-700",
    deepLink: (amount: number, orderId: string) => 
      `amazonpay://pay?pa=merchant@upi&pn=YourStore&am=${amount}&tn=Order ${orderId}&cu=INR`
  }
];

interface PaymentAppsSelectorProps {
  paymentData: {
    total: number;
    orderId: string;
  };
}

export function PaymentAppsSelector({ paymentData }: PaymentAppsSelectorProps) {
  const [, setLocation] = useLocation();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAppSelection = (app: PaymentApp) => {
    setSelectedApp(app.id);
    
    // Create deep link
    const deepLink = app.deepLink(paymentData.total, paymentData.orderId);
    
    toast({
      title: `Opening ${app.name}`,
      description: "You'll be redirected to complete payment",
    });

    // Try to open the app
    const link = document.createElement('a');
    link.href = deepLink;
    link.click();
    
    // Fallback: redirect to payment processing page
    setTimeout(() => {
      setLocation(`/payment-processing?app=${app.id}&orderId=${paymentData.orderId}`);
    }, 1000);
  };

  const goBack = () => {
    setLocation('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={goBack} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Choose Payment App</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Select App</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-sm border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select Your Payment App
              </h2>
              <p className="text-gray-600">
                Choose your preferred UPI app to complete the payment
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-lg font-semibold text-gray-900">
                  Amount: ₹{paymentData.total?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment Apps Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {paymentApps.map((app) => {
                const IconComponent = app.icon;
                return (
                  <button
                    key={app.id}
                    onClick={() => handleAppSelection(app)}
                    disabled={selectedApp !== null}
                    className={`${app.bgColor} ${app.textColor} p-6 rounded-lg border-2 border-transparent hover:border-blue-300 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                    data-testid={`button-${app.id}`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <IconComponent className="w-12 h-12" />
                      <div>
                        <p className="font-semibold text-lg">{app.name}</p>
                        <div className="flex items-center justify-center text-sm opacity-75 mt-1">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          <span>Open App</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3 mt-0.5">1</div>
                  <div>Select your preferred payment app above</div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3 mt-0.5">2</div>
                  <div>You'll be redirected to the app automatically</div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3 mt-0.5">3</div>
                  <div>Complete payment in the app (amount already filled)</div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs mr-3 mt-0.5">4</div>
                  <div>Return here for payment confirmation</div>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={goBack}
              className="w-full mt-6"
            >
              Back to Payment Options
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}