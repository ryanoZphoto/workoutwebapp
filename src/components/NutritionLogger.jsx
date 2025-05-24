import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function NutritionLogger() {
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [meals, setMeals] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: ''
  });

  useEffect(() => {
    if (Object.keys(weeklyData.meals).length === 0) {
      setMeals({ breakfast: '', lunch: '', dinner: '', snacks: '' });
    }
  }, [weeklyData.meals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeals({ ...meals, [name]: value });
  };

  const saveMeals = () => {
    const updated = { ...weeklyData, meals: { ...meals } };
    setWeeklyData(updated);
    alert('Meals saved.');
  };

  const renderMeals = () => {
    const logged = weeklyData.meals;
    if (!logged || Object.keys(logged).length === 0) {
      return <p className="text-sm text-gray-400">No meals logged yet.</p>;
    }

    return (
      <ul className="text-sm text-gray-300 list-disc pl-4">
        {Object.entries(logged).map(([meal, items], i) => (
          <li key={i}><strong>{meal}:</strong> {items}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Nutrition Logger</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <input
          name="breakfast"
          placeholder="Breakfast"
          value={meals.breakfast}
          onChange={handleChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="lunch"
          placeholder="Lunch"
          value={meals.lunch}
          onChange={handleChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="dinner"
          placeholder="Dinner"
          value={meals.dinner}
          onChange={handleChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="snacks"
          placeholder="Snacks"
          value={meals.snacks}
          onChange={handleChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
      </div>

      <div className="text-right">
        <button
          onClick={saveMeals}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          Save Meals
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-2">Logged Meals</h3>
        {renderMeals()}
      </div>
    </div>
  );
}
