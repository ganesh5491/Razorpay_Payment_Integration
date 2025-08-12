import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodSelectorProps {
  selectedMethod: "upi" | "qr" | "card" | "cod" | "apps" | null;
  onMethodChange: (method: "upi" | "qr" | "card" | "cod" | "apps") => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4 mb-8">
      <RadioGroup
        value={selectedMethod || ""}
        onValueChange={(value) => onMethodChange(value as "upi" | "qr" | "card" | "cod" | "apps")}
        className="space-y-4"
      >
        {/* UPI Payment Option */}
        <div className="relative">
          <Label
            htmlFor="upi"
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
              selectedMethod === "upi" ? "border-primary bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="upi" id="upi" className="mr-4" />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-12 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-bold text-xs">UPI</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">UPI</p>
                  <p className="text-sm text-gray-500">Pay using any UPI app</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">Instant</div>
          </Label>
        </div>

        {/* Payment Apps Option */}
        {/* <div className="relative">
          <Label
            htmlFor="apps"
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
              selectedMethod === "apps" ? "border-primary bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="apps" id="apps" className="mr-4" />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex space-x-1 mr-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded text-xs flex items-center justify-center font-bold">P</div>
                  <div className="w-6 h-6 bg-blue-500 text-white rounded text-xs flex items-center justify-center font-bold">G</div>
                  <div className="w-6 h-6 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">₹</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Payment Apps</p>
                  <p className="text-sm text-gray-500">PhonePe, Google Pay, Paytm & more</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">Popular</div>
          </Label>
        </div> */}

        {/* QR Code Payment Option */}
        <div className="relative">
          <Label
            htmlFor="qr"
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
              selectedMethod === "qr" ? "border-primary bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="qr" id="qr" className="mr-4" />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-12 h-8 bg-indigo-100 rounded flex items-center justify-center mr-3">
                  <i className="fas fa-qrcode text-indigo-600 text-lg"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">QR Code</p>
                  <p className="text-sm text-gray-500">Scan and pay with any app</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">Quick</div>
          </Label>
        </div>

        {/* Card Payment Option */}
        <div className="relative">
          <Label
            htmlFor="card"
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
              selectedMethod === "card" ? "border-primary bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="card" id="card" className="mr-4" />
            <div className="flex-1">
              <div className="flex items-center">
                <div className="flex space-x-1 mr-3">
                  <i className="fab fa-cc-visa text-blue-600 text-2xl"></i>
                  <i className="fab fa-cc-mastercard text-red-500 text-2xl"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Credit/Debit Card</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard, Amex & more</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">Secure</div>
          </Label>
        </div>

        {/* COD Payment Option */}
        <div className="relative">
          <Label
            htmlFor="cod"
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors ${
              selectedMethod === "cod" ? "border-primary bg-blue-50" : "border-gray-200"
            }`}
          >
            <RadioGroupItem value="cod" id="cod" className="mr-4" />
            <div className="flex-1">
              <div className="flex items-center">
                <i className="fas fa-money-bill-wave text-green-600 text-2xl mr-3"></i>
                <div>
                  <p className="font-medium text-gray-900">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when you receive</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-accent font-medium">₹20 fee</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
