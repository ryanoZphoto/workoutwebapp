import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Legs'];

export default function WorkoutLogger() {
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [current, setCurrent] = useState({
    group: 'Chest',
    name: '',
    sets: '',
    reps: '',
    weight: '',
    duration: ''
  });

  useEffect(() => {
    if (Object.keys(weeklyData.workouts).length === 0) {
      setCurrent({
        group: 'Chest',
        name: '',
        sets: '',
        reps: '',
        weight: '',
        duration: ''
      });
    }
  }, [weeklyData.workouts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrent({ ...current, [name]: value });
  };

  const addExercise = () => {
    const updated = { ...weeklyData };
    if (!updated.workouts[current.group]) {
      updated.workouts[current.group] = [];
    }

    updated.workouts[current.group].push({
      name: current.name,
      sets: current.sets,
      reps: current.reps,
      weight: current.weight,
      duration: current.duration
    });

    setWeeklyData(updated);

    setCurrent({
      group: current.group,
      name: '',
      sets: '',
      reps: '',
      weight: '',
      duration: ''
    });
  };

  const renderWorkouts = () => {
    const w = weeklyData.workouts;
    if (!w || Object.keys(w).length === 0) return <p className="text-gray-400 text-sm">No exercises logged yet.</p>;

    return Object.entries(w).map(([group, entries]) => (
      <div key={group} className="mb-4">
        <h3 className="font-semibold text-blue-300">{group}</h3>
        <ul className="pl-4 list-disc text-sm text-gray-300">
          {entries.map((ex, i) => (
            <li key={i}>
              {ex.name} – {ex.sets} sets × {ex.reps} reps @ {ex.weight}lbs {ex.duration && `(for ${ex.duration}min)`}
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-white">Workout Logger</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <select
          name="group"
          value={current.group}
          onChange={handleInputChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        >
          {muscleGroups.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          name="name"
          placeholder="Exercise"
          value={current.name}
          onChange={handleInputChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="sets"
          placeholder="Sets"
          type="number"
          value={current.sets}
          onChange={handleInputChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="reps"
          placeholder="Reps"
          type="number"
          value={current.reps}
          onChange={handleInputChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="weight"
          placeholder="Weight (lbs)"
          type="number"
          value={current.weight}
          onChange={handleInputChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          name="duration"
          placeholder="Duration (min)"
          type="number"
          value={current.duration}
          onChange={handleInputChange}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
      </div>

      <div className="text-right">
        <button
          onClick={addExercise}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          Add Exercise
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-2">Logged Exercises</h3>
        {renderWorkouts()}
      </div>
    </div>
  );
}
