import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodSelectorProps {
  selectedMethod: "upi" | "card" | "cod" | null;
  onMethodChange: (method: "upi" | "card" | "cod") => void;
}

export function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4 mb-8">
      <RadioGroup
        value={selectedMethod || ""}
        onValueChange={(value) => onMethodChange(value as "upi" | "card" | "cod")}
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
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60" 
                  alt="UPI Payment" 
                  className="w-12 h-8 object-contain mr-3" 
                />
                <div>
                  <p className="font-medium text-gray-900">UPI</p>
                  <p className="text-sm text-gray-500">Pay using any UPI app</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">Instant</div>
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
