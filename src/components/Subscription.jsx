import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function Subscription() {
  const { preferences } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.REACT_APP_STRIPE_PRICE_ID,
          // Include user ID if you have authentication
          // userId: currentUser.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const session = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError('Failed to start checkout. Please try again.');
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
