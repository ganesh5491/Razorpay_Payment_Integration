import React, { useState } from 'react';
import axios from 'axios';
import { loadRazorpay } from '@/lib/load-razorpay';

interface CardPaymentProps {
  amount: number;
  orderId: string;
  currency?: string;
  onSuccess: (response: any) => void;
  onFailure: (error: string) => void;
}

export const CardPayment: React.FC<CardPaymentProps> = ({
  amount,
  orderId,
  currency = 'INR',
  onSuccess,
  onFailure,
}) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loadRazorpay();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        order_id: orderId,
        name: 'Your Store Name',
        description: 'Payment for your order',
        prefill: {
          name: cardDetails.name,
          email: 'customer@example.com',
          contact: '+919876543210'
        },
        handler: async (response: any) => {
          try {
            const verification = await axios.post('/api/payments/verify', {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess(verification.data);
          } catch (error) {
            onFailure('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      onFailure('Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="block mb-2">Card Number</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={cardDetails.number}
          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>
      
      <div className="flex space-x-4">
        <div className="form-group flex-1">
          <label className="block mb-2">Expiry</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={cardDetails.expiry}
            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
            placeholder="MM/YY"
            required
          />
        </div>
        
        <div className="form-group flex-1">
          <label className="block mb-2">CVV</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={cardDetails.cvv}
            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
            placeholder="123"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="block mb-2">Cardholder Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={cardDetails.name}
          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
          placeholder="Name on card"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
};