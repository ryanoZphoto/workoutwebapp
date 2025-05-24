import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './styles.css';
// Entry point and layout
import WorkoutLogger from "./components/WorkoutLogger";
import NutritionLogger from "./components/NutritionLogger";
import HydrationTracker from "./components/HydrationTracker";
import ArchiveManager from "./components/ArchiveManager";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-sans">
      <h1 className="text-3xl mb-4 text-blue-400">Weekly Fitness Tracker</h1>

      <WorkoutLogger />
      <NutritionLogger />
      <HydrationTracker />
      <ArchiveManager />
    </div>
  );
}
