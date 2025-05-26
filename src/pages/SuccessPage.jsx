import React from 'react';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <h1 className="text-3xl mb-4 text-blue-400">Subscription Successful!</h1>
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
