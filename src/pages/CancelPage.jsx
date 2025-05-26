import React from 'react';

export default function CancelPage() {
  return (
    <div className="text-center p-8 max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-white">Subscription Cancelled</h2>
      <p className="text-gray-300 mb-4">You've cancelled the subscription process. No charges were made.</p>
      
      <div className="bg-gray-700 p-4 rounded-lg my-4">
        <p className="font-semibold text-blue-400 mb-2">You're missing out!</p>
        <p className="text-gray-300 text-sm">Remember, our premium subscription includes:</p>
        <ul className="text-gray-300 text-sm mt-2 text-left list-disc pl-5 space-y-1">
          <li>Personalized workout recommendations</li>
          <li>Advanced analytics and progress tracking</li>
          <li>Complete nutrition planning tools</li>
          <li>Data export and backup</li>
        </ul>
        <p className="text-gray-300 text-sm mt-3"><span className="font-bold">First month FREE</span>, then just <span className="font-bold">$1.00/month</span></p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
        >
          Return to Dashboard
        </button>
        <button 
          onClick={() => window.location.href = '/subscription'}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded font-medium transition-colors"
        >
          Try Premium Free
        </button>
      </div>
    </div>
  );
}