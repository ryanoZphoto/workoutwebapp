import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function SuccessPage() {
  const [status, setStatus] = useState('loading');
  const [subscription, setSubscription] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Get session ID from URL
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          setStatus('error');
          return;
        }
        
        // Fetch session details
        const response = await fetch(`/api/checkout-session?sessionId=${sessionId}`);
        
        if (!response.ok) {
          setStatus('error');
          return;
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
        setStatus('success');
      } catch (error) {
        console.error('Error fetching session:', error);
        setStatus('error');
      }
    };
    
    fetchSession();
  }, [location]);
  
  if (status === 'loading') {
    return <div className="text-center p-8">Loading subscription details...</div>;
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
      {subscription && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p><strong>Subscription ID:</strong> {subscription.id}</p>
          <p><strong>Status:</strong> {subscription.status}</p>
          <p><strong>Trial End:</strong> {new Date(subscription.trial_end * 1000).toLocaleDateString()}</p>
        </div>
      )}
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Return to Dashboard
      </button>
    </div>
  );
}