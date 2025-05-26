import React, { useContext } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import { AppContext } from '../context/AppContext';

export default function ProgressDashboard() {
  const { weeklyData } = useContext(AppContext);
  
  // Create workout data for visualization
  const workoutData = Object.entries(weeklyData.workouts || {}).map(([day, data]) => ({
    name: day,
    duration: data.duration || 0,
    intensity: data.intensity || 0,
  }));

  // Calculate total water intake for the week - handle both array and legacy number format
  const totalWater = (() => {
    if (Array.isArray(weeklyData.hydration)) {
      return weeklyData.hydration.reduce((acc, day) => acc + (day.amount || 0), 0);
    } else if (typeof weeklyData.hydration === 'number') {
      return weeklyData.hydration;
    }
    return 0;
  })();
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Weekly Progress Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Workout Duration Chart */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-blue-300">Workout Duration</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
              <Legend />
              <Bar dataKey="duration" fill="#0088FE" name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Workout Intensity Chart */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-green-300">Workout Intensity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={workoutData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke="#00C49F" 
                activeDot={{ r: 8 }} 
                name="Level (1-10)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Hydration Overview */}
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2 text-blue-300">Weekly Hydration</h3>
        <div className="flex items-center">
          <div className="w-1/3">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Current', value: totalWater },
                    { name: 'Target', value: Math.max(0, 14000 - totalWater) }, // 2000ml per day * 7 days
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-2/3 pl-4">
            <h4 className="text-white font-medium">Weekly Water Intake</h4>
            <p className="text-2xl text-blue-400 font-bold mt-2">{totalWater}ml</p>
            <p className="text-sm text-gray-400 mt-1">
              {totalWater >= 14000 
                ? "Great job! You have met your weekly hydration target." 
                : `${Math.round((totalWater / 14000) * 100)}% of weekly target (14,000ml)`
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Weekly Summary Card */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3 text-purple-300">Weekly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-400">Workouts Completed</p>
            <p className="text-3xl font-bold text-blue-300 mt-1">
              {Object.keys(weeklyData.workouts || {}).length}
            </p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-400">Avg. Workout Duration</p>
            <p className="text-3xl font-bold text-green-300 mt-1">
              {workoutData.length > 0 
                ? Math.round(workoutData.reduce((acc, curr) => acc + curr.duration, 0) / workoutData.length) 
                : 0} min
            </p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg text-center">
            <p className="text-sm text-gray-400">Avg. Daily Hydration</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">
              {(weeklyData.hydration || []).length > 0
                ? Math.round(totalWater / (weeklyData.hydration || []).length)
                : 0} ml
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
