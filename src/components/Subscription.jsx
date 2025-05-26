import React, { useState, useEffect } from 'react';

export default function Subscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check if user is already subscribed
    const checkSubscription = async () => {
      try {
        // This would be an API call to your backend to check subscription status
        // For demonstration purposes, we'll check localStorage
        const userSubscription = localStorage.getItem('userSubscription');
        if (userSubscription) {
          setSubscription(JSON.parse(userSubscription));
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };
    
    checkSubscription();
  }, []);
  
  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the customer ID from somewhere (context, localStorage, etc.)
      const customerId = subscription.customerId;
      
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.href,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }
      
      const { url } = await response.json();
      
      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      setError(error.message || 'Failed to access subscription management. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the price ID from environment variable
      const priceId = process.env.REACT_APP_STRIPE_PRICE_ID;
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          productDescription: {
            name: "Fitness Tracker Premium",
            description: "Unlock your full fitness potential with advanced tracking, personalized workouts, and exclusive features.",
            features: [
              "Unlimited workout logging and tracking",
              "Personalized workout recommendations based on your history",
              "Advanced analytics and progress reporting",
              "Custom meal planning and nutrition tracking",
              "Hydration monitoring with smart reminders",
              "Export and backup your fitness data",
              "Priority access to new features"
            ],
            trialPeriod: "First month FREE",
            billingCycle: "Monthly subscription",
            price: "$1.00/month"
          }
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
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg max-w-md mx-auto border border-blue-500">
      {subscription ? (
        // User is already subscribed
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Your Premium Subscription</h2>
            <span className={`${subscription.status === 'trialing' ? 'bg-green-600' : 'bg-blue-600'} text-white text-xs px-2 py-1 rounded-full`}>
              {subscription.status === 'trialing' ? 'FREE MONTH ACTIVE' : 'ACTIVE'}
            </span>
          </div>
          
          <p className="text-gray-300 mb-2">
            You're enjoying all premium features of Fitness Tracker.
          </p>
          
          {subscription.status === 'trialing' ? (
            <div className="mb-2">
              <p className="text-gray-300 text-sm">Your free month ends on {new Date(subscription.trialEnd).toLocaleDateString()}</p>
              <p className="text-gray-300 text-sm mt-1">After that, you'll be charged <span className="text-blue-400 font-bold">$1.00/month</span></p>
            </div>
          ) : (
            <div className="mb-2">
              <span className="text-blue-400 text-2xl font-bold">$1.00</span>
              <span className="text-gray-400 text-sm">/month</span>
              <p className="text-gray-300 text-sm mt-1">Next payment on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
            </div>
          )}
        </>
      ) : (
        // User is not subscribed
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Fitness Tracker Premium</h2>
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">FIRST MONTH FREE</span>
          </div>
          
          <p className="text-gray-300 mb-2">
            Unlock your full fitness potential with our premium features.
          </p>
          
          <div className="mb-2">
            <span className="text-blue-400 text-2xl font-bold">$1.00</span>
            <span className="text-gray-400 text-sm">/month after free month</span>
          </div>
          
          <p className="text-gray-400 text-xs mb-4">
            No commitment. Cancel anytime before your free month ends and you won't be charged.
          </p>
        </>
      )}
      </p>
      
      <div className="mb-6 border-t border-gray-700 pt-4">
        <h3 className="text-white font-medium mb-3">What's included:</h3>
        <ul className="text-gray-300 space-y-3">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Personalized workouts</strong> - Tailored recommendations based on your history and goals</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Advanced analytics</strong> - Track progress with detailed metrics and insights</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Nutrition & hydration</strong> - Comprehensive meal planning and hydration tracking</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Data export & backup</strong> - Secure your fitness journey with cloud backups</span>
          </li>
        </ul>
      </div>
      
      {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
      
      {subscription ? (
        // Manage subscription button
        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className={`w-full ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-4 rounded-lg font-medium transition-colors`}
        >
          {loading ? 'Processing...' : 'Manage Your Subscription'}
        </button>
      ) : (
        // Start trial button
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-4 rounded-lg font-medium transition-colors`}
        >
          {loading ? 'Processing...' : 'Start Your Free Month'}
        </button>
      )}
      
      <p className="text-gray-500 text-xs text-center mt-4">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

