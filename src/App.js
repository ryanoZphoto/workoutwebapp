import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// Using absolute import to avoid path resolution issues
import './styles.css';
// Entry point and layout
import WorkoutLogger from "./components/WorkoutLogger";
import NutritionLogger from "./components/NutritionLogger";
import HydrationTracker from "./components/HydrationTracker";
import ArchiveManager from "./components/ArchiveManager";
import ProgressDashboard from "./components/ProgressDashboard";
import WorkoutRecommender from "./components/WorkoutRecommender";
import MealPlanner from "./components/MealPlanner";
// Import new pages
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import Subscription from "./components/Subscription";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <Router>
      <Routes>
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/" element={
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
                <button
                  onClick={() => setActiveTab('subscription')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'subscription'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                  }`}
                >
                  Premium
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
            {activeTab === 'subscription' && <Subscription />}
          </div>
        } />
      </Routes>
    </Router>
  );
}
