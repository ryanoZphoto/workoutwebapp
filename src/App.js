import React, { useState } from 'react';
import './styles.css';
// Entry point and layout
import WorkoutLogger from "./components/WorkoutLogger";
import NutritionLogger from "./components/NutritionLogger";
import HydrationTracker from "./components/HydrationTracker";
import ArchiveManager from "./components/ArchiveManager";
import ProgressDashboard from "./components/ProgressDashboard";
import WorkoutRecommender from "./components/WorkoutRecommender";
import MealPlanner from "./components/MealPlanner";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl mb-2 text-blue-400">Weekly Fitness Tracker</h1>
        <p className="text-gray-400">Track, analyze, and optimize your fitness journey</p>
      </header>
      
      <div className="mb-6 border-b border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workouts'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            Workouts
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nutrition'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            Nutrition
          </button>
          <button
            onClick={() => setActiveTab('hydration')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hydration'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            Hydration
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'archive'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
            }`}
          >
            Archive
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && <ProgressDashboard />}
      {activeTab === 'workouts' && (
        <>
          <WorkoutLogger />
          <WorkoutRecommender />
        </>
      )}
      {activeTab === 'nutrition' && (
        <>
          <NutritionLogger />
          <MealPlanner />
        </>
      )}
      {activeTab === 'hydration' && <HydrationTracker />}
      {activeTab === 'recommendations' && (
        <>
          <WorkoutRecommender />
          <MealPlanner />
        </>
      )}
      {activeTab === 'archive' && <ArchiveManager />}
    </div>
  );
}
