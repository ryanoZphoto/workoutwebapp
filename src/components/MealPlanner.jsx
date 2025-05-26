import React, { useState } from 'react';

// Sample meal database
const mealDatabase = {
  breakfast: [
    { name: 'Greek Yogurt with Berries', calories: 250, protein: 20, carbs: 30, fat: 5 },
    { name: 'Avocado Toast with Egg', calories: 350, protein: 15, carbs: 25, fat: 20 },
    { name: 'Protein Smoothie', calories: 300, protein: 25, carbs: 35, fat: 8 },
    { name: 'Oatmeal with Nuts & Fruit', calories: 380, protein: 12, carbs: 45, fat: 15 },
    { name: 'Veggie Omelet', calories: 280, protein: 22, carbs: 8, fat: 18 }
  ],
  lunch: [
    { name: 'Grilled Chicken Salad', calories: 380, protein: 35, carbs: 15, fat: 18 },
    { name: 'Turkey & Avocado Wrap', calories: 420, protein: 28, carbs: 35, fat: 20 },
    { name: 'Quinoa Buddha Bowl', calories: 450, protein: 15, carbs: 60, fat: 15 },
    { name: 'Tuna Salad with Crackers', calories: 350, protein: 30, carbs: 25, fat: 15 },
    { name: 'Lentil Soup with Side Salad', calories: 320, protein: 18, carbs: 40, fat: 8 }
  ],
  dinner: [
    { name: 'Salmon with Roasted Vegetables', calories: 420, protein: 38, carbs: 20, fat: 22 },
    { name: 'Stir-Fried Tofu with Vegetables', calories: 380, protein: 20, carbs: 30, fat: 18 },
    { name: 'Lean Beef Chili', calories: 450, protein: 35, carbs: 35, fat: 15 },
    { name: 'Baked Chicken with Sweet Potato', calories: 410, protein: 35, carbs: 40, fat: 12 },
    { name: 'Shrimp and Vegetable Pasta', calories: 480, protein: 25, carbs: 60, fat: 12 }
  ],
  snacks: [
    { name: 'Apple with Peanut Butter', calories: 200, protein: 7, carbs: 25, fat: 8 },
    { name: 'Protein Bar', calories: 180, protein: 15, carbs: 20, fat: 6 },
    { name: 'Mixed Nuts', calories: 170, protein: 6, carbs: 5, fat: 15 },
    { name: 'Greek Yogurt with Honey', calories: 150, protein: 12, carbs: 15, fat: 3 },
    { name: 'Vegetable Sticks with Hummus', calories: 120, protein: 5, carbs: 15, fat: 5 }
  ]
};

// Different diet types
const dietTypes = [
  { id: 'balanced', name: 'Balanced', description: 'A well-rounded diet with balanced macronutrients' },
  { id: 'high-protein', name: 'High Protein', description: 'Emphasizes protein intake for muscle building and recovery' },
  { id: 'low-carb', name: 'Low Carb', description: 'Reduces carbohydrate intake for weight management' },
  { id: 'vegetarian', name: 'Vegetarian', description: 'Plant-based diet excluding meat' },
  { id: 'keto', name: 'Keto', description: 'Very low carb, high fat diet to promote ketosis' }
];

// Activity levels
const activityLevels = [
  { id: 'sedentary', name: 'Sedentary', factor: 1.2, description: 'Little to no exercise' },
  { id: 'light', name: 'Lightly Active', factor: 1.375, description: '1-3 days/week of exercise' },
  { id: 'moderate', name: 'Moderately Active', factor: 1.55, description: '3-5 days/week of exercise' },
  { id: 'very', name: 'Very Active', factor: 1.725, description: '6-7 days/week of exercise' },
  { id: 'extreme', name: 'Extremely Active', factor: 1.9, description: 'Very intense daily exercise or physical job' }
];

export default function MealPlanner() {
  // Commented out weeklyData as it's not used in this component yet
  // const { weeklyData } = useContext(AppContext);
  
  const [userStats, setUserStats] = useState({
    weight: 70, // kg
    height: 170, // cm
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    dietType: 'balanced',
    goal: 'maintain' // lose, maintain, gain
  });
  
  const [mealPlan, setMealPlan] = useState(null);
  
  // Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { weight, height, age, gender } = userStats;
    if (gender === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };
  
  // Calculate daily calorie needs
  const calculateCalories = () => {
    const bmr = calculateBMR();
    const activityFactor = activityLevels.find(a => a.id === userStats.activityLevel)?.factor || 1.55;
    let calories = bmr * activityFactor;
    
    // Adjust based on goal
    switch (userStats.goal) {
      case 'lose':
        calories -= 500; // 500 calorie deficit
        break;
      case 'gain':
        calories += 500; // 500 calorie surplus
        break;
      default:
        // maintain - no adjustment needed
        break;
    }
    
    return Math.round(calories);
  };
  
  // Generate a meal plan based on user stats and preferences
  const generateMealPlan = () => {
    const totalCalories = calculateCalories();
    // Allocate calories by meal
    const breakfastCals = totalCalories * 0.25;
    const lunchCals = totalCalories * 0.35;
    const dinnerCals = totalCalories * 0.30;
    const snackCals = totalCalories * 0.10;
    
    // Helper function to find closest meal by calories and diet type
    const findBestMeal = (mealList, targetCalories) => {
      // For demo purposes, just selecting by closest calories
      return mealList.reduce((prev, curr) => 
        Math.abs(curr.calories - targetCalories) < Math.abs(prev.calories - targetCalories) ? curr : prev
      );
    };
    
    const plan = {
      totalCalories,
      breakfast: findBestMeal(mealDatabase.breakfast, breakfastCals),
      lunch: findBestMeal(mealDatabase.lunch, lunchCals),
      dinner: findBestMeal(mealDatabase.dinner, dinnerCals),
      snack: findBestMeal(mealDatabase.snacks, snackCals)
    };
    
    // Calculate actual totals
    plan.actualCalories = plan.breakfast.calories + plan.lunch.calories + plan.dinner.calories + plan.snack.calories;
    plan.actualProtein = plan.breakfast.protein + plan.lunch.protein + plan.dinner.protein + plan.snack.protein;
    plan.actualCarbs = plan.breakfast.carbs + plan.lunch.carbs + plan.dinner.carbs + plan.snack.carbs;
    plan.actualFat = plan.breakfast.fat + plan.lunch.fat + plan.dinner.fat + plan.snack.fat;
    
    setMealPlan(plan);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserStats(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Smart Meal Planner</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-3 text-blue-300">Your Information</h3>
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Weight (kg)</label>
                <input 
                  type="number"
                  name="weight"
                  value={userStats.weight}
                  onChange={handleInputChange}
                  className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Height (cm)</label>
                <input 
                  type="number"
                  name="height"
                  value={userStats.height}
                  onChange={handleInputChange}
                  className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Age</label>
                <input 
                  type="number"
                  name="age"
                  value={userStats.age}
                  onChange={handleInputChange}
                  className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Gender</label>
                <select 
                  name="gender"
                  value={userStats.gender}
                  onChange={handleInputChange}
                  className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm text-gray-300 mb-1">Activity Level</label>
              <select 
                name="activityLevel"
                value={userStats.activityLevel}
                onChange={handleInputChange}
                className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
              >
                {activityLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name} - {level.description}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm text-gray-300 mb-1">Diet Type</label>
              <select 
                name="dietType"
                value={userStats.dietType}
                onChange={handleInputChange}
                className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
              >
                {dietTypes.map(diet => (
                  <option key={diet.id} value={diet.id}>{diet.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mt-3">
              <label className="block text-sm text-gray-300 mb-1">Goal</label>
              <select 
                name="goal"
                value={userStats.goal}
                onChange={handleInputChange}
                className="bg-gray-600 text-white px-3 py-2 rounded w-full text-sm"
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle Mass</option>
              </select>
            </div>
            
            <button 
              onClick={generateMealPlan}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors w-full"
            >
              Generate Meal Plan
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3 text-green-300">Your Meal Plan</h3>
          {mealPlan ? (
            <div className="bg-gray-700 p-4 rounded-lg">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Daily Calorie Target:</span>
                  <span className="text-sm font-medium text-white">{mealPlan.totalCalories} kcal</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (mealPlan.actualCalories / mealPlan.totalCalories) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Actual: {mealPlan.actualCalories} kcal</span>
                  <span>{((mealPlan.actualCalories / mealPlan.totalCalories) * 100).toFixed(1)}% of goal</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-gray-400">Protein</div>
                  <div className="text-white font-medium">{mealPlan.actualProtein}g</div>
                  <div className="text-xs text-gray-400">{Math.round((mealPlan.actualProtein * 4 / mealPlan.actualCalories) * 100)}%</div>
                </div>
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-gray-400">Carbs</div>
                  <div className="text-white font-medium">{mealPlan.actualCarbs}g</div>
                  <div className="text-xs text-gray-400">{Math.round((mealPlan.actualCarbs * 4 / mealPlan.actualCalories) * 100)}%</div>
                </div>
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-gray-400">Fat</div>
                  <div className="text-white font-medium">{mealPlan.actualFat}g</div>
                  <div className="text-xs text-gray-400">{Math.round((mealPlan.actualFat * 9 / mealPlan.actualCalories) * 100)}%</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-blue-300 font-medium">BREAKFAST</div>
                  <div className="text-white text-sm mt-1">{mealPlan.breakfast.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {mealPlan.breakfast.calories} kcal • {mealPlan.breakfast.protein}g protein • {mealPlan.breakfast.carbs}g carbs • {mealPlan.breakfast.fat}g fat
                  </div>
                </div>
                
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-blue-300 font-medium">LUNCH</div>
                  <div className="text-white text-sm mt-1">{mealPlan.lunch.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {mealPlan.lunch.calories} kcal • {mealPlan.lunch.protein}g protein • {mealPlan.lunch.carbs}g carbs • {mealPlan.lunch.fat}g fat
                  </div>
                </div>
                
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-blue-300 font-medium">DINNER</div>
                  <div className="text-white text-sm mt-1">{mealPlan.dinner.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {mealPlan.dinner.calories} kcal • {mealPlan.dinner.protein}g protein • {mealPlan.dinner.carbs}g carbs • {mealPlan.dinner.fat}g fat
                  </div>
                </div>
                
                <div className="bg-gray-600 p-2 rounded">
                  <div className="text-xs text-blue-300 font-medium">SNACK</div>
                  <div className="text-white text-sm mt-1">{mealPlan.snack.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {mealPlan.snack.calories} kcal • {mealPlan.snack.protein}g protein • {mealPlan.snack.carbs}g carbs • {mealPlan.snack.fat}g fat
                  </div>
                </div>
              </div>
              
              <button className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors w-full text-sm">
                Save This Meal Plan
              </button>
            </div>
          ) : (
            <div className="bg-gray-700 p-5 rounded-lg text-center text-gray-400 flex flex-col items-center justify-center" style={{ minHeight: '350px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Fill in your information and click "Generate Meal Plan" to create a personalized meal plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
