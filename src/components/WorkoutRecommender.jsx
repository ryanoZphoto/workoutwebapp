import React, { useContext, useMemo, useState, useEffect } from 'react';
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
  const { weeklyData, setWeeklyData } = useContext(AppContext);
  const [storageInfo, setStorageInfo] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Enhanced logging function
  const logMessage = (message, data = null, type = 'info') => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      message,
      data: data ? JSON.stringify(data) : null,
      type
    };
    
    console[type](message, data);
    setLogs(prevLogs => [logEntry, ...prevLogs].slice(0, 50)); // Keep only last 50 logs
  };
  
  // Fix data structure issues related to hydration entries
  useEffect(() => {
    try {
      // Check what storage mechanisms are available and in use
      const storageDetails = {
        usingLocalStorage: !!localStorage.getItem('weeklyData') || false,
        usingSessionStorage: !!sessionStorage.getItem('weeklyData') || false,
        hasCookies: document.cookie.includes('weeklyData'),
        contextData: !!weeklyData,
        netlifyIdentity: window.netlifyIdentity !== undefined
      };
      
      setStorageInfo(storageDetails);
      
      // Specifically look for and fix the error #31 - objects with {day, amount, timestamp}
      if (weeklyData) {
        let hasDataIssues = false;
        let dataInfo = { structure: {} };
        let needsHydrationFix = false;
        
        // Check for direct hydration objects that might cause React error #31
        if (weeklyData.hydration && typeof weeklyData.hydration === 'object' && !Array.isArray(weeklyData.hydration)) {
          if (weeklyData.hydration.day || weeklyData.hydration.amount || weeklyData.hydration.timestamp) {
            logMessage('Found problematic hydration object that could cause Error #31', weeklyData.hydration, 'warn');
            needsHydrationFix = true;
          }
        }
        
        // Check for array of hydration objects
        if (Array.isArray(weeklyData.hydration)) {
          weeklyData.hydration.forEach((entry, index) => {
            if (entry && typeof entry === 'object' && (entry.day || entry.amount || entry.timestamp)) {
              logMessage(`Found problematic hydration entry at index ${index}`, entry, 'warn');
              needsHydrationFix = true;
            }
          });
        }
        
        // Inspect workouts structure
        if (weeklyData.workouts) {
          dataInfo.structure.workouts = typeof weeklyData.workouts;
          
          // Check if there are any invalid entries in workouts
          Object.entries(weeklyData.workouts || {}).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (item && typeof item === 'object' && !React.isValidElement(item)) {
                  dataInfo[`workout_${key}_${index}`] = Object.keys(item);
                }
              });
            } else if (typeof value === 'object' && value !== null) {
              dataInfo[`workout_${key}_invalid`] = typeof value;
              hasDataIssues = true;
              logMessage(`Found invalid workout entry for ${key}`, value, 'warn');
            }
          });
        }
        
        setDebugInfo({ hasDataIssues, needsHydrationFix, dataInfo });
        
        // Fix the data structure issues
        if (hasDataIssues || needsHydrationFix) {
          logMessage("Attempting to fix data structure issues...", null, 'info');
          const fixedData = { ...weeklyData };
          
          // Fix hydration issue - convert object to number or initialize properly
          if (needsHydrationFix) {
            // Reset hydration to be a simple number
            fixedData.hydration = 0;
            logMessage("Reset hydration data to prevent Error #31", null, 'info');
          }
          
          // Ensure workouts is an object with arrays
          if (fixedData.workouts) {
            Object.entries(fixedData.workouts).forEach(([key, value]) => {
              if (!Array.isArray(value)) {
                fixedData.workouts[key] = [];
                logMessage(`Fixed workout format for ${key}`, null, 'info');
              }
            });
          } else {
            fixedData.workouts = {};
          }
          
          // Ensure meals is an object
          if (!fixedData.meals || typeof fixedData.meals !== 'object' || Array.isArray(fixedData.meals)) {
            fixedData.meals = {};
            logMessage("Reset meals data structure", null, 'info');
          }
          
          // Update the fixed data
          setWeeklyData(fixedData);
          logMessage("Applied data structure fixes", fixedData, 'info');
          
          // Also update localStorage if that's what we're using
          if (storageDetails.usingLocalStorage) {
            try {
              localStorage.setItem('weeklyData', JSON.stringify(fixedData));
              logMessage("Updated localStorage with fixed data structure", null, 'success');
            } catch (e) {
              logMessage("Failed to update localStorage", e, 'error');
            }
          }
        }
      }
    } catch (error) {
      logMessage('Error in data inspection:', error, 'error');
    }
  }, [weeklyData, setWeeklyData]);
  
  // Handle workout addition with better error handling
  const addWorkoutToLog = (workout, focusNeeded) => {
    try {
      // Create a deep copy to avoid reference issues
      const updated = JSON.parse(JSON.stringify(weeklyData || { workouts: {} }));
      
      if (!updated.workouts) {
        updated.workouts = {};
      }
      
      // Map workout type to a muscle group
      const muscleGroup = focusNeeded === 'strength' ? 
        'Full Body' : (focusNeeded === 'flexibility' ? 'Mobility' : 'Cardio');
      
      // Ensure the muscle group entry is an array
      if (!updated.workouts[muscleGroup] || !Array.isArray(updated.workouts[muscleGroup])) {
        updated.workouts[muscleGroup] = [];
      }
      
      // Add workout with proper structure
      updated.workouts[muscleGroup].push({
        name: workout.name || 'Unnamed workout',
        sets: '1',
        reps: '1',
        weight: '0',
        duration: workout.duration ? String(workout.duration) : '30',
        type: focusNeeded || 'general',
        date: new Date().toISOString().split('T')[0] // Add date for archiving purposes
      });
      
      // Update state
      setWeeklyData(updated);
      
      // Also update localStorage if that's what we're using
      if (localStorage.getItem('weeklyData')) {
        localStorage.setItem('weeklyData', JSON.stringify(updated));
      }
      
      alert(`Added ${workout.name} to your workout log!`);
    } catch (error) {
      console.error('Error adding workout to log:', error);
      alert('Sorry, there was an error adding the workout. Please try again.');
    }
  };
  
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
  
  // Ensure recommendations are valid
  if (!recommendations || typeof recommendations !== 'object') {
    console.error('Invalid recommendations structure:', recommendations);
    return (
      <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-white">Workout Recommendations</h2>
        <p className="text-gray-300 mb-4">Unable to generate recommendations at this time.</p>
      </div>
    );
  }
  
  // Ensure workouts is an array
  const workoutsArray = Array.isArray(recommendations.workouts) ? recommendations.workouts : [];
  const levelString = typeof recommendations.level === 'string' ? recommendations.level : 'beginner';
  const focusNeededString = typeof recommendations.focusNeeded === 'string' ? recommendations.focusNeeded : 'general';
  
  return (
    <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Workout Recommendations</h2>
        <span className="bg-blue-500 text-xs font-medium px-2.5 py-0.5 rounded-full text-white">
          {levelString}
        </span>
      </div>
      
      <p className="text-gray-300 mb-4">
        Based on your activity, we recommend focusing on <span className="text-blue-400 font-medium">{focusNeededString}</span> training today.
      </p>
      
      <h3 className="text-lg text-blue-300 font-medium mb-2">Suggested for {today}:</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workoutsArray.length > 0 ? workoutsArray.map((workout, index) => {
          if (!workout || typeof workout !== 'object') {
            return null;
          }
          
          const name = String(workout.name || 'Workout');
          const duration = workout.duration !== undefined ? String(workout.duration) : '30';
          const description = String(workout.description || 'No description available');
          
          return (
            <div key={index} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{name}</h4>
                  <span className="bg-blue-600 text-xs px-2 py-1 rounded text-white">
                    {duration} min
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{description}</p>
                <button 
                  onClick={() => addWorkoutToLog(workout, recommendations.focusNeeded)}
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded transition-colors w-full">
                  Add to Log
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-3">
            <p className="text-gray-400 text-center">No workout recommendations available yet. Try logging a few workouts first.</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-700 mt-4 p-3 rounded text-sm text-gray-400">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recommendations adapt based on your logged workouts and progress.
        </p>
        {storageInfo && (
          <div className="mt-2 p-2 bg-gray-800 rounded overflow-auto max-h-32">
            <p className="text-xs font-mono">Storage Details:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(storageInfo, null, 2)}
            </pre>
            {debugInfo && (debugInfo.hasDataIssues || debugInfo.needsHydrationFix) && (
              <div className="mt-1 p-1 bg-red-900 bg-opacity-30 rounded">
                <p className="text-xs text-red-300">
                  ⚠️ Data structure issues detected
                  {debugInfo.needsHydrationFix && " (including hydration data format)"}
                </p>
              </div>
            )}
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => {
                  logMessage('User viewed current data', weeklyData, 'info');
                  const localData = localStorage.getItem('weeklyData');
                  console.log('LocalStorage Data:', localData ? JSON.parse(localData) : null);
                  alert('Storage info logged to console. Open browser developer tools to view.');
                }}
                className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded">
                Debug Data
              </button>
              <button
                onClick={() => setLogs([])}
                className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded">
                Clear Logs
              </button>
            </div>
            {/* Add collapsible logs section */}
            <details className="mt-2">
              <summary className="text-xs cursor-pointer hover:text-white">App Logs ({logs.length})</summary>
              <div className="mt-1 text-xs bg-gray-900 p-1 rounded overflow-auto max-h-64">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`mb-1 p-1 rounded ${
                        log.type === 'error' ? 'bg-red-900 bg-opacity-20' : 
                        log.type === 'warn' ? 'bg-yellow-900 bg-opacity-20' : 
                        'bg-blue-900 bg-opacity-10'
                      }`}
                    >
                      <div className="font-mono text-gray-500">{log.timestamp}</div>
                      <div className={
                        log.type === 'error' ? 'text-red-400' : 
                        log.type === 'warn' ? 'text-yellow-400' : 
                        'text-blue-400'
                      }>
                        {log.message}
                      </div>
                      {log.data && <pre className="overflow-x-auto whitespace-pre-wrap">{log.data}</pre>}
                    </div>
                  ))
                ) : (
                  <p>No logs yet</p>
                )}
              </div>
            </details>
            
            {/* Fix button for hydration error #31 */}
            {debugInfo && debugInfo.needsHydrationFix && (
              <button
                onClick={() => {
                  try {
                    // Create a clean data structure to fix the Error #31
                    const fixedData = {
                      workouts: weeklyData.workouts || {},
                      meals: weeklyData.meals || {},
                      hydration: 0  // Reset to number to fix the object issue
                    };
                    
                    // Update state and localStorage
                    setWeeklyData(fixedData);
                    localStorage.setItem('weeklyData', JSON.stringify(fixedData));
                    logMessage("Fixed Error #31 by resetting hydration data", null, 'success');
                    alert("Data structure has been fixed. Any existing hydration data has been reset.");
                  } catch (e) {
                    logMessage("Failed to fix Error #31", e, 'error');
                    console.error("Failed to fix data:", e);
                  }
                }}
                className="mt-2 text-xs bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded w-full">
                Fix Error #31 (Reset Hydration)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
