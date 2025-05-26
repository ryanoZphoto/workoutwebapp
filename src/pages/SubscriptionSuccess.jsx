import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function SubscriptionSuccess() {
  const [status, setStatus] = useState('loading');
  const location = useLocation();
  
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Get session ID from URL
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          setStatus('error');
          return;
        }
        
        // Verify session with your backend
        const response = await fetch('/api/verify-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        
        if (response.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setStatus('error');
      }
    };
    
    verifySubscription();
  }, [location]);
  
  if (status === 'loading') {
    return <div className="text-center p-8">Verifying your subscription...</div>;
  }
  
  if (status === 'error') {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl mb-4">Something went wrong</h2>
        <p>We couldn't verify your subscription. Please contact support.</p>
      </div>
    );
  }
  
  return (
    <div className="text-center p-8 max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg border border-blue-500">
      <div className="bg-green-600 text-white p-2 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">Subscription Successful!</h2>
      <p className="mb-2 text-gray-300">Thank you for subscribing to Fitness Tracker Premium!</p>
      
      <div className="bg-gray-700 p-4 rounded-lg my-4">
        <p className="font-semibold text-blue-400 mb-2">Your free month has started!</p>
        <p className="text-gray-300 text-sm">You won't be charged until your free month ends.</p>
        <p className="text-gray-300 text-sm mt-2">After your free month, you'll be charged just <span className="font-bold">$1.00/month</span>.</p>
      </div>
      
      <p className="text-gray-400 text-xs mb-4">
        You can cancel anytime before your free month ends with no charge.
      </p>
      
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
      >
        Get Started Now
      </button>
    </div>
  );
}