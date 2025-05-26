import React from 'react';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <h1 className="text-3xl mb-4 text-blue-400">Subscription Cancelled</h1>
      <p>You've cancelled the subscription process. No charges were made.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
