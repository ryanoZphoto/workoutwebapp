import React from 'react';
import WorkoutLogger from './components/WorkoutLogger';
import NutritionLogger from './components/NutritionLogger';
import HydrationTracker from './components/HydrationTracker';
import ArchiveManager from './components/ArchiveManager';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-400 mb-2">Fitness Tracker</h1>
        <p className="text-sm text-gray-400">Track workouts, meals, hydration, and weekly progress with confidence.</p>
      </header>

      <main className="space-y-8">
        <WorkoutLogger />
        <NutritionLogger />
        <HydrationTracker />
        <ArchiveManager />
      </main>
    </div>
  );
}
