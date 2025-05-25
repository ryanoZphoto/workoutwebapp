import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const foodData = {
  'Eggs (1 large)': { calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  'Oatmeal (1 cup)': { calories: 150, protein: 5, carbs: 27, fat: 3 },
  'Chicken Breast (3oz)': { calories: 140, protein: 26, carbs: 0, fat: 3 },
  'Rice (1 cup)': { calories: 206, protein: 4, carbs: 45, fat: 0.4 },
  'Broccoli (1 cup)': { calories: 55, protein: 4, carbs: 11, fat: 0.3 },
  'Apple (medium)': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
};

export default function NutritionLogger() {
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [meals, setMeals] = useState({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: ''
  });
  const [nutritionInfo, setNutritionInfo] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
    snacks: null
  });

  useEffect(() => {
    if (Object.keys(weeklyData.meals).length === 0) {
      setMeals({ breakfast: '', lunch: '', dinner: '', snacks: '' });
    }
  }, [weeklyData.meals]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMeals({ ...meals, [name]: value });
    if (foodData[value]) {
      setNutritionInfo({ ...nutritionInfo, [name]: foodData[value] });
    } else {
      setNutritionInfo({ ...nutritionInfo, [name]: null });
    }
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
          <li key={i}>
            <strong>{meal}:</strong> {items}
            {foodData[items] && (
              <span className="text-gray-400"> — {foodData[items].calories} cal, {foodData[items].protein}g P, {foodData[items].carbs}g C, {foodData[items].fat}g F</span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Nutrition Logger</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <input
            name="breakfast"
            list="food-options"
            placeholder="Breakfast"
            value={meals.breakfast}
            onChange={handleChange}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
          {nutritionInfo.breakfast && (
            <p className="text-xs text-gray-400 mt-1">
              {`Cal: ${nutritionInfo.breakfast.calories} • P: ${nutritionInfo.breakfast.protein}g • C: ${nutritionInfo.breakfast.carbs}g • F: ${nutritionInfo.breakfast.fat}g`}
            </p>
          )}
        </div>
        <div>
          <input
            name="lunch"
            list="food-options"
            placeholder="Lunch"
            value={meals.lunch}
            onChange={handleChange}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
          {nutritionInfo.lunch && (
            <p className="text-xs text-gray-400 mt-1">
              {`Cal: ${nutritionInfo.lunch.calories} • P: ${nutritionInfo.lunch.protein}g • C: ${nutritionInfo.lunch.carbs}g • F: ${nutritionInfo.lunch.fat}g`}
            </p>
          )}
        </div>
        <div>
          <input
            name="dinner"
            list="food-options"
            placeholder="Dinner"
            value={meals.dinner}
            onChange={handleChange}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
          {nutritionInfo.dinner && (
            <p className="text-xs text-gray-400 mt-1">
              {`Cal: ${nutritionInfo.dinner.calories} • P: ${nutritionInfo.dinner.protein}g • C: ${nutritionInfo.dinner.carbs}g • F: ${nutritionInfo.dinner.fat}g`}
            </p>
          )}
        </div>
        <div>
          <input
            name="snacks"
            list="food-options"
            placeholder="Snacks"
            value={meals.snacks}
            onChange={handleChange}
            className="bg-gray-700 text-white p-2 rounded w-full"
          />
          {nutritionInfo.snacks && (
            <p className="text-xs text-gray-400 mt-1">
              {`Cal: ${nutritionInfo.snacks.calories} • P: ${nutritionInfo.snacks.protein}g • C: ${nutritionInfo.snacks.carbs}g • F: ${nutritionInfo.snacks.fat}g`}
            </p>
          )}
        </div>
        <datalist id="food-options">
          {Object.keys(foodData).map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
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
