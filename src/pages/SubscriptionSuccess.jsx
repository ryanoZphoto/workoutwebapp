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
    <div className="text-center p-8">
      <h2 className="text-xl mb-4">Subscription Successful!</h2>
      <p className="mb-4">Thank you for subscribing to Fitness Tracker Premium!</p>
      <p>Your 30-day free trial has started. You won't be charged until the trial period ends.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Return to Dashboard
      </button>
    </div>
  );
}