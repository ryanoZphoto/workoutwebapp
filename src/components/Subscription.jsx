import React, { useState } from 'react';

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the price ID from environment variable or use a hardcoded one for testing
      const priceId = process.env.REACT_APP_STRIPE_PRICE_ID || 'price_1RSvgKGGQwlxsXJhPrn36hB4';
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">Fitness Tracker Premium</h2>
      <p className="text-gray-300 mb-4">
        Try free for 1 month, then just $1/month.
      </p>
      <ul className="text-gray-300 mb-6 list-disc pl-5">
        <li>Unlimited workout tracking</li>
        <li>Advanced meal planning</li>
        <li>Progress analytics</li>
        <li>Export data as PDF</li>
      </ul>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded transition-colors`}
      >
        {loading ? 'Loading...' : 'Start Free Trial'}
      </button>
    </div>
  );
}


