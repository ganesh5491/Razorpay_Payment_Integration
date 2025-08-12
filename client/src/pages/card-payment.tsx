import React, { useState } from 'react';
import axios from 'axios';

const CardPayment = ({ amount, onSuccess, onFailure }) => {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Step 1: Create order
      const orderResponse = await axios.post('/api/create-card-order', {
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      });

      // Step 2: Process payment
      const options = {
        key: 'YOUR_RAZORPAY_KEY',
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        order_id: orderResponse.data.id,
        name: 'Your Store Name',
        description: 'Purchase Description',
        prefill: {
          name: cardDetails.name,
          email: 'customer@example.com',
          contact: '+919876543210'
        },
        handler: function(response) {
          // Step 3: Verify payment
          verifyPayment(response);
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      onFailure(error.message);
      setLoading(false);
    }
  };

  const verifyPayment = async (response) => {
    try {
      const verification = await axios.post('/api/verify-payment', response);
      if (verification.data.success) {
        onSuccess(response);
      } else {
        onFailure('Payment verification failed');
      }
    } catch (error) {
      onFailure(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Card Number</label>
        <input
          type="text"
          value={cardDetails.number}
          onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Expiry</label>
          <input
            type="text"
            value={cardDetails.expiry}
            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
            placeholder="MM/YY"
            required
          />
        </div>
        
        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={cardDetails.cvv}
            onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
            placeholder="123"
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Cardholder Name</label>
        <input
          type="text"
          value={cardDetails.name}
          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
          placeholder="Name on card"
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

export default CardPayment;