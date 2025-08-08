import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Shield } from "lucide-react";

interface OrderItem {
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  codFee: number;
  total: number;
  onPlaceOrder: () => void;
  isLoading: boolean;
}

export function OrderSummary({ 
  items, 
  subtotal, 
  tax, 
  codFee, 
  total, 
  onPlaceOrder, 
  isLoading 
}: OrderSummaryProps) {
  return (
    <Card className="shadow-sm border-gray-200 sticky top-8">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
        
        {/* Order Items */}
        <div className="space-y-4 mb-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded-lg" 
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                {item.variant && (
                  <p className="text-sm text-gray-500">{item.variant}</p>
                )}
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">₹{item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (18% GST)</span>
            <span className="text-gray-900">₹{tax.toLocaleString()}</span>
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
              <span className="text-lg font-semibold text-gray-900">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Promo Code */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex space-x-2">
            <Input placeholder="Promo code" className="flex-1" />
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
              Apply
            </Button>
          </div>
        </div>

        {/* Place Order Button */}
        <Button 
          onClick={onPlaceOrder}
          disabled={isLoading}
          className="w-full mt-6 bg-primary text-white hover:bg-blue-700"
        >
          {isLoading ? "Processing..." : "Place Order"}
        </Button>

        {/* Security Badges */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Shield className="h-3 w-3 text-green-600 mr-1" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center">
            <Lock className="h-3 w-3 text-green-600 mr-1" />
            <span>256-bit Encryption</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
