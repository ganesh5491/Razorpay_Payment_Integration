import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BillingAddressData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  pincode: string;
}

interface BillingAddressProps {
  billingAddress: BillingAddressData;
  onAddressChange: (address: BillingAddressData) => void;
}

export function BillingAddress({ billingAddress, onAddressChange }: BillingAddressProps) {
  const handleChange = (field: keyof BillingAddressData, value: string) => {
    onAddressChange({
      ...billingAddress,
      [field]: value,
    });
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-md font-medium text-gray-900 mb-4">Billing Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={billingAddress.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={billingAddress.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </Label>
          <Input
            id="address"
            type="text"
            placeholder="123 Main Street"
            value={billingAddress.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Mumbai"
            value={billingAddress.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
            PIN Code
          </Label>
          <Input
            id="pincode"
            type="text"
            placeholder="400001"
            value={billingAddress.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
