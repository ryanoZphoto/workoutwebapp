import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function HydrationTracker() {
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [cups, setCups] = useState('');
  
  // Initialize total water amount from hydration array
  const totalWater = Array.isArray(weeklyData.hydration) 
    ? weeklyData.hydration.reduce((sum, entry) => sum + (entry.amount || 0), 0) 
    : (weeklyData.hydration || 0);
  
  const [waterAmount, setWaterAmount] = useState(totalWater ? totalWater.toString() : '');

  useEffect(() => {
    // Reset cups if there's no hydration data
    if ((Array.isArray(weeklyData.hydration) && weeklyData.hydration.length === 0) || 
        weeklyData.hydration === 0) {
      setCups('');
      setWaterAmount('');
    }
  }, [weeklyData.hydration]);

  const saveHydration = () => {
    const amount = Number(waterAmount);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Create a new hydration entry
    const newEntry = {
      day: today,
      amount: amount,
      timestamp: new Date().toISOString()
    };
    
    // Handle the case where hydration could be either an array or a number (for backward compatibility)
    const currentHydration = Array.isArray(weeklyData.hydration) ? weeklyData.hydration : [];
    
    const updated = { 
      ...weeklyData, 
      hydration: [...currentHydration, newEntry]
    };
    
    setWeeklyData(updated);
    alert('Water intake saved.');
  };

  // Calculate daily goal progress
  const dailyGoal = weeklyData.goals?.waterIntake || 2000; // ml
  const totalConsumed = totalWater;
  const progress = Math.min(100, (totalConsumed / dailyGoal) * 100);
  
  // Track today's entries
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaysEntries = Array.isArray(weeklyData.hydration) 
    ? weeklyData.hydration.filter(entry => entry.day === today)
    : [];

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Hydration Tracker</h2>
      
      {/* Daily Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-300">Daily Goal: {dailyGoal}ml</span>
          <span className="text-sm text-green-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs text-gray-400 text-right">
          {totalConsumed}ml / {dailyGoal}ml
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Water Amount (ml)</label>
          <input
            type="number"
            min="0"
            value={waterAmount}
            onChange={(e) => setWaterAmount(e.target.value)}
            placeholder="Water amount in ml"
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-300 mb-1">Water in Cups (8oz/240ml)</label>
          <input
            type="number"
            min="0"
            value={cups}
            onChange={(e) => {
              setCups(e.target.value);
              setWaterAmount((parseFloat(e.target.value) * 240).toString());
            }}
            placeholder="Cups (8oz each)"
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
        </div>
        
        <button
          onClick={saveHydration}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm w-full"
        >
          Log Water Intake
        </button>
      </div>
      
      {/* Today's Entries */}
      <div className="mt-6">
        <h3 className="text-md font-medium text-blue-300 mb-2">Today's Hydration Log</h3>
        {todaysEntries.length > 0 ? (
          <div className="bg-gray-700 rounded-lg p-3">
            <ul className="space-y-2">
              {todaysEntries.map((entry, index) => (
                <li key={index} className="flex justify-between text-sm p-1 border-b border-gray-600">
                  <span className="text-gray-300">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-medium text-white">{entry.amount} ml</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-2 border-t border-gray-600 flex justify-between text-sm">
              <span className="text-gray-300">Total Today:</span>
              <span className="font-medium text-green-400">
                {todaysEntries.reduce((sum, entry) => sum + entry.amount, 0)} ml
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 bg-gray-700 p-3 rounded-lg">No hydration logged for today yet.</p>
        )}
      </div>
      
      {/* Weekly Summary */}
      <div className="mt-6">
        <h3 className="text-md font-medium text-blue-300 mb-2">Weekly Summary</h3>
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-center pb-3 border-b border-gray-600">
            <div className="text-3xl font-bold text-blue-400">{totalWater} ml</div>
            <div className="text-xs text-gray-400 mt-1">Total this week</div>
          </div>
          
          <div className="mt-3 text-sm text-gray-300">
            <p>Drinking enough water helps improve energy levels, brain function, and physical performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
