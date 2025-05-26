import React, { useContext, useMemo } from 'react';
import { AppContext } from '../context/AppContext';

// Sample workout library
const workoutLibrary = {
  beginner: {
    strength: [
      { name: 'Bodyweight Basics', description: 'Squats, push-ups, lunges, planks', duration: 20 },
      { name: 'Light Dumbbell Circuit', description: '3 rounds of dumbbell exercises with 60s rest', duration: 25 },
      { name: 'Core Foundations', description: 'Focus on developing core strength and stability', duration: 15 }
    ],
    cardio: [
      { name: 'Beginner HIIT', description: '20s on, 40s off - jumping jacks, high knees, etc.', duration: 15 },
      { name: 'Walk-Jog Intervals', description: '1 min walk, 1 min light jog for 20 minutes', duration: 20 },
      { name: 'Step Aerobics', description: 'Low impact cardio with stepping patterns', duration: 20 }
    ],
    flexibility: [
      { name: 'Basic Stretching', description: 'Full body stretch routine, hold each for 30s', duration: 15 },
      { name: 'Intro to Yoga', description: 'Basic yoga poses for beginners', duration: 20 },
      { name: 'Mobility Basics', description: 'Joint mobility exercises for better movement', duration: 15 }
    ]
  },
  intermediate: {
    strength: [
      { name: 'Dumbbell Strength', description: '4 sets of 8-12 reps of compound movements', duration: 40 },
      { name: 'Bodyweight Advanced', description: 'Progressive variations of push-ups, squats, etc.', duration: 35 },
      { name: 'Supersets Challenge', description: 'Paired exercises with minimal rest between sets', duration: 30 }
    ],
    cardio: [
      { name: 'Intermediate HIIT', description: '30s work, 30s rest for 8 rounds', duration: 30 },
      { name: 'Tempo Run', description: '5 min warm-up, 20 min steady pace, 5 min cool-down', duration: 30 },
      { name: 'Jump Rope Intervals', description: '1 min high intensity, 30s rest for 10 rounds', duration: 25 }
    ],
    flexibility: [
      { name: 'Dynamic Stretching', description: 'Movement-based stretching routine', duration: 20 },
      { name: 'Intermediate Yoga', description: 'Flow sequences with moderate difficulty', duration: 30 },
      { name: 'Foam Rolling', description: 'Self-myofascial release for tight muscles', duration: 20 }
    ]
  },
  advanced: {
    strength: [
      { name: 'Heavy Compound Lifts', description: '5x5 of squats, deadlifts, bench press, rows', duration: 50 },
      { name: 'Pyramid Sets', description: 'Increasing weight, decreasing reps for maximum stimulus', duration: 45 },
      { name: 'Calisthenics Mastery', description: 'Advanced bodyweight movements like muscle-ups', duration: 40 }
    ],
    cardio: [
      { name: 'Advanced HIIT', description: '40s work, 20s rest for 10 rounds of complex movements', duration: 40 },
      { name: 'Tabata Protocol', description: '20s max effort, 10s rest for 8 rounds of 4 exercises', duration: 35 },
      { name: 'Sprint Intervals', description: '30s all-out sprint, 90s recovery jog for 8 rounds', duration: 40 }
    ],
    flexibility: [
      { name: 'Advanced Yoga', description: 'Challenging poses and longer holds', duration: 40 },
      { name: 'PNF Stretching', description: 'Contract-relax technique for improved flexibility', duration: 30 },
      { name: 'Full Mobility Routine', description: 'Comprehensive mobility work for all joints', duration: 35 }
    ]
  }
};

export default function WorkoutRecommender() {
  const { weeklyData } = useContext(AppContext);
  
  // Analyze past workouts to determine appropriate level and focus
  const recommendations = useMemo(() => {
    // Default to beginner if not enough data
    let level = 'beginner';
    let focusNeeded = 'strength'; // Default focus
    
    // Safely handle data access - handle the case where weeklyData might be undefined or have incorrect structure
    if (!weeklyData || typeof weeklyData !== 'object') {
      return { level, focusNeeded, workouts: workoutLibrary[level][focusNeeded] };
    }
    
    const workouts = weeklyData.workouts || {};
    const workoutEntries = Object.entries(workouts);
    
    if (workoutEntries.length >= 3) {
      // Determine level based on average intensity
      const avgIntensity = workoutEntries.reduce((acc, [_, workout]) => {
        // Check if workout is a valid object
        if (!workout || typeof workout !== 'object') return acc;
        return acc + (workout.intensity || 0);
      }, 0) / workoutEntries.length;
      
      if (avgIntensity > 7) {
        level = 'advanced';
      } else if (avgIntensity > 4) {
        level = 'intermediate';
      }
      
      // Determine workout focus based on past workouts
      const workoutTypes = workoutEntries.map(([_, workout]) => {
        if (!workout || typeof workout !== 'object') return '';
        return (workout.type && typeof workout.type === 'string') ? workout.type.toLowerCase() : '';
      });
      
      const hasStrength = workoutTypes.some(type => type.includes('strength') || type.includes('weight'));
      const hasCardio = workoutTypes.some(type => type.includes('cardio') || type.includes('run') || type.includes('hiit'));
      const hasFlexibility = workoutTypes.some(type => type.includes('yoga') || type.includes('stretch') || type.includes('mobility'));
      
      // Suggest what's missing from their routine
      if (!hasStrength) {
        focusNeeded = 'strength';
      } else if (!hasCardio) {
        focusNeeded = 'cardio';
      } else if (!hasFlexibility) {
        focusNeeded = 'flexibility';
      } else {
        // If they have a balanced routine, suggest based on lowest frequency
        const strengthCount = workoutTypes.filter(t => t.includes('strength') || t.includes('weight')).length;
        const cardioCount = workoutTypes.filter(t => t.includes('cardio') || t.includes('run') || t.includes('hiit')).length;
        const flexibilityCount = workoutTypes.filter(t => t.includes('yoga') || t.includes('stretch') || t.includes('mobility')).length;
        
        const min = Math.min(strengthCount, cardioCount, flexibilityCount);
        if (min === strengthCount) focusNeeded = 'strength';
        else if (min === cardioCount) focusNeeded = 'cardio';
        else focusNeeded = 'flexibility';
      }
    }
    
    // Safely get appropriate workout recommendations with fallbacks
    let focusWorkouts;
    try {
      // Make sure we only access valid paths in the workout library
      if (!workoutLibrary[level] || !workoutLibrary[level][focusNeeded]) {
        // Fallback to beginner strength if the calculated level/focus doesn't exist
        focusWorkouts = workoutLibrary.beginner.strength;
      } else {
        focusWorkouts = workoutLibrary[level][focusNeeded];
      }
    } catch (error) {
      // Ultimate fallback if anything goes wrong
      focusWorkouts = workoutLibrary.beginner.strength;
    }
    
    return {
      level,
      focusNeeded,
      workouts: focusWorkouts
    };
  }, [weeklyData]);

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Workout Recommendations</h2>
        <span className="bg-blue-500 text-xs font-medium px-2.5 py-0.5 rounded-full text-white">
          {recommendations.level}
        </span>
      </div>
      
      <p className="text-gray-300 mb-4">
        Based on your activity, we recommend focusing on <span className="text-blue-400 font-medium">{recommendations.focusNeeded}</span> training today.
      </p>
      
      <h3 className="text-lg text-blue-300 font-medium mb-2">Suggested for {today}:</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.workouts.map((workout, index) => (
          <div key={index} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium">{workout.name}</h4>
                <span className="bg-blue-600 text-xs px-2 py-1 rounded text-white">
                  {workout.duration} min
                </span>
              </div>
              <p className="text-gray-400 text-sm">{workout.description}</p>
              <button className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded transition-colors w-full">
                Add to Log
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-700 mt-4 p-3 rounded text-sm text-gray-400">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recommendations adapt based on your logged workouts and progress.
        </p>
      </div>
    </div>
  );
}
