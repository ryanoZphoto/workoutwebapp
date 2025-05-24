import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function HydrationTracker() {
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [cups, setCups] = useState(weeklyData.hydration || '');

  useEffect(() => {
    if (weeklyData.hydration === 0) {
      setCups('');
    }
  }, [weeklyData.hydration]);

  const saveHydration = () => {
    const updated = { ...weeklyData, hydration: Number(cups) };
    setWeeklyData(updated);
    alert('Water intake saved.');
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Hydration Tracker</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 items-center">
        <input
          type="number"
          min="0"
          value={cups}
          onChange={(e) => setCups(e.target.value)}
          placeholder="Cups (8oz each)"
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <button
          onClick={saveHydration}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
        >
          Save Water
        </button>
      </div>

      <p className="text-sm text-gray-300">
        Current hydration logged: <strong>{weeklyData.hydration || 0}</strong> cups
      </p>
    </div>
  );
}
