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
  const [activeTab, setActiveTab] = useState('recommendations'); // New state for tab navigation
  const [showHelp, setShowHelp] = useState(false); // State for help tooltips
  const [isFilterOpen, setIsFilterOpen] = useState(false); // For filter dropdown
  const [filter, setFilter] = useState({ level: 'all', type: 'all' }); // Filter state
  
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

  // Add workout progress calculation
  const progressStats = useMemo(() => {
    if (!weeklyData || !weeklyData.workouts) return null;
    
    const workouts = weeklyData.workouts;
    const allWorkouts = Object.values(workouts).flat();
    
    // Count workout types
    const strengthCount = allWorkouts.filter(w => 
      w.type && w.type.toLowerCase().includes('strength')).length;
    const cardioCount = allWorkouts.filter(w => 
      w.type && (w.type.toLowerCase().includes('cardio') || w.type.toLowerCase().includes('hiit'))).length;
    const flexibilityCount = allWorkouts.filter(w => 
      w.type && (w.type.toLowerCase().includes('yoga') || w.type.toLowerCase().includes('stretch'))).length;
    const totalCount = allWorkouts.length;
    
    // Calculate total workout time
    const totalMinutes = allWorkouts.reduce((total, workout) => {
      const duration = parseInt(workout.duration) || 0;
      return total + duration;
    }, 0);
    
    // Get most recent workout
    const sortedWorkouts = [...allWorkouts].sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });
    const lastWorkout = sortedWorkouts.length > 0 ? sortedWorkouts[0] : null;
    
    return {
      totalWorkouts: totalCount,
      totalMinutes,
      strengthCount,
      cardioCount,
      flexibilityCount,
      lastWorkout
    };
  }, [weeklyData]);

  // Filtered recommendations
  const filteredWorkouts = useMemo(() => {
    if (!recommendations || !recommendations.workouts) return [];
    
    let filtered = [...recommendations.workouts];
    
    // Apply level filter if not set to 'all'
    if (filter.level !== 'all') {
      // This is a bit counterintuitive since we're already showing level-specific workouts
      // But we include this for future expansion when we might show workouts from multiple levels
    }
    
    // Apply type filter if not set to 'all'
    if (filter.type !== 'all' && filter.type !== recommendations.focusNeeded) {
      // Find workouts in the selected type from the workout library
      const levelKey = recommendations.level || 'beginner';
      const typeKey = filter.type || 'strength';
      
      if (workoutLibrary[levelKey] && workoutLibrary[levelKey][typeKey]) {
        filtered = workoutLibrary[levelKey][typeKey];
      }
    }
    
    return filtered;
  }, [recommendations, filter]);
  
  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Early return for invalid recommendations
  if (!recommendations || typeof recommendations !== 'object') {
    return (
      <div className="bg-gray-800 p-5 rounded-xl shadow-md max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold text-white">Workout Recommendations</h2>
        <p className="text-gray-300 mb-4">Unable to generate recommendations at this time.</p>
      </div>
    );
  }
  
  // Ensure workouts is an array
  const workoutsArray = filteredWorkouts.length > 0 ? filteredWorkouts : [];
  const levelString = typeof recommendations.level === 'string' ? recommendations.level : 'beginner';
  const focusNeededString = typeof recommendations.focusNeeded === 'string' ? recommendations.focusNeeded : 'general';
  
  // Function to render help tooltip
  const renderTooltip = (text) => {
    if (!showHelp) return null;
    return (
      <div className="absolute z-10 bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs -mt-1 ml-6">
        {text}
      </div>
    );
  };
  
  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg max-w-6xl mx-auto mb-8 transition-all duration-300">
      {/* Header with title, level badge, and help toggle */}
      <div className="flex flex-wrap justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            <span className="text-blue-400">Fit</span>Track
          </h2>
          <span className="bg-blue-500 text-xs font-medium px-2.5 py-0.5 rounded-full text-white">
            {levelString}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className={`text-sm py-1 px-3 rounded-full border ${
              showHelp 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-transparent border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400'
            } transition-colors`}
          >
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>
          
          {debugInfo && (debugInfo.hasDataIssues || debugInfo.needsHydrationFix) && (
            <button
              onClick={() => setActiveTab('debug')}
              className="text-sm py-1 px-3 rounded-full border border-red-500 bg-red-900 bg-opacity-30 text-red-400 hover:bg-opacity-50 transition-colors"
            >
              Issues Found
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
            activeTab === 'recommendations'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          } transition-colors`}
        >
          Recommendations
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
            activeTab === 'progress'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-300'
          } transition-colors`}
        >
          Your Progress
        </button>
        {storageInfo && (
          <button
            onClick={() => setActiveTab('debug')}
            className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
              activeTab === 'debug'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            } transition-colors`}
          >
            Debug Panel
          </button>
        )}
      </div>
      
      {/* Recommendations Tab Content */}
      {activeTab === 'recommendations' && (
        <>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white font-semibold relative">
                Today's Workout Plan
                {renderTooltip("We analyze your workout history to recommend what you should focus on today.")}
              </h3>
              
              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 py-1.5 px-3 rounded-lg transition-colors"
                ></button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                
                {isFilterOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-lg shadow-lg overflow-hidden z-10"></div>
                    <div className="p-3">
                      <div className="mb-2">
                        <label className="text-xs font-medium text-gray-400 block mb-1">Workout Type</label>
                        <select
                          className="w-full bg-gray-800 text-white text-sm rounded-md p-1.5"
                          value={filter.type}
                          onChange={(e) => setFilter({...filter, type: e.target.value})}
                        ></select>
                          <option value="all">All Types</option>
                          <option value="strength">Strength</option>
                          <option value="cardio">Cardio</option>
                          <option value="flexibility">Flexibility</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => {
                            setFilter({ level: 'all', type: 'all' });
                            setIsFilterOpen(false);
                          }}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div></div>
            </div>
            
            <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4 mb-4"></div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-white font-medium">
                  {today}'s Focus: <span className="text-blue-400">{focusNeededString.charAt(0).toUpperCase() + focusNeededString.slice(1)}</span>
                </p>
              </div>
              <p className="text-gray-300 text-sm ml-9">
                Based on your recent activity, we recommend focusing on <span className="text-blue-400 font-medium">{focusNeededString}</span> training today to balance your workout routine.
              </p>
            </div>
          </div>
          
          {/* Filter badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filter.type !== 'all' && (
              <span className="bg-blue-900 bg-opacity-30 text-blue-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                {filter.type.charAt(0).toUpperCase() + filter.type.slice(1)} Only
                <button onClick={() => setFilter({...filter, type: 'all'})}></button>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
          
          {/* Workout recommendations grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {workoutsArray.length > 0 ? workoutsArray.map((workout, index) => {
              if (!workout || typeof workout !== 'object') {
                return null;
              }
              
              const name = String(workout.name || 'Workout');
              const duration = workout.duration !== undefined ? String(workout.duration) : '30';
              const description = String(workout.description || 'No description available');
              
              return (
                <div key={index} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors transform hover:-translate-y-1 hover:shadow-lg duration-300">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-white font-medium">{name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded text-white flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {duration} min
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{description}</p>
                    <button 
                      onClick={() => {
                        addWorkoutToLog(workout, recommendations.focusNeeded);
                        // Show success feedback
                        const button = document.getElementById(`add-workout-${index}`);
                        if (button) {
                          button.innerText = "Added!";
                          button.classList.add("bg-green-600");
                          setTimeout(() => {
                            button.innerText = "Add to Log";
                            button.classList.remove("bg-green-600");
                          }, 1500);
                        }
                      }}
                      id={`add-workout-${index}`}
                      className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors w-full font-medium flex items-center justify-center gap-2"
                    ></button>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add to Log
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-700 rounded-lg p-8 text-center"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-center mb-2">No workout recommendations available yet.</p>
                <p className="text-gray-500 text-sm">Try logging a few workouts first to get personalized recommendations.</p>
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Progress Tab Content */}
      {activeTab === 'progress' && (
        <div className="mb-6"></div>
          <h3 className="text-xl text-white font-semibold mb-4 relative">
            Your Workout Journey
            {renderTooltip("Track your progress and see your workout statistics over time.")}
          </h3>
          
          {progressStats ? (
            <></>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Workouts</p>
                  <p className="text-white text-2xl font-bold">{progressStats.totalWorkouts}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Total Time</p>
                  <p className="text-white text-2xl font-bold">{progressStats.totalMinutes} mins</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Last Workout</p>
                  <p className="text-white text-lg font-medium truncate">
                    {progressStats.lastWorkout ? progressStats.lastWorkout.name : 'None'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {progressStats.lastWorkout ? new Date(progressStats.lastWorkout.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h4 className="text-white font-medium mb-3">Workout Balance</h4>
                <div className="flex h-8 rounded-lg overflow-hidden mb-2">
                  {progressStats.totalWorkouts > 0 ? (
                    <>
                      <div 
                        className="bg-blue-600 h-full" 
                        style={{ width: `${(progressStats.strengthCount / progressStats.totalWorkouts * 100) || 0}%` }}
                        title={`Strength: ${progressStats.strengthCount} workouts`}
                      />
                      <div 
                        className="bg-green-600 h-full" 
                        style={{ width: `${(progressStats.cardioCount / progressStats.totalWorkouts * 100) || 0}%` }}
                        title={`Cardio: ${progressStats.cardioCount} workouts`}
                      />
                      <div 
                        className="bg-purple-600 h-full" 
                        style={{ width: `${(progressStats.flexibilityCount / progressStats.totalWorkouts * 100) || 0}%` }}
                        title={`Flexibility: ${progressStats.flexibilityCount} workouts`}
                      />
                      <div 
                        className="bg-gray-600 h-full" 
                        style={{ width: `${((progressStats.totalWorkouts - progressStats.strengthCount - progressStats.cardioCount - progressStats.flexibilityCount) / progressStats.totalWorkouts * 100) || 0}%` }}
                        title="Other workouts"
                      />
                    </>
                  ) : (
                    <div className="bg-gray-600 h-full w-full" />
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-gray-300">Strength ({progressStats.strengthCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    <span className="text-gray-300">Cardio ({progressStats.cardioCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                    <span className="text-gray-300">Flexibility ({progressStats.flexibilityCount})</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900 bg-opacity-20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next Steps
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  {progressStats.totalWorkouts === 0 ? (
                    "Start by logging your first workout! Use our recommendations as a guide."
                  ) : progressStats.totalWorkouts < 5 ? (
                    "Great start! Keep logging your workouts to get more personalized recommendations."
                  ) : progressStats.strengthCount === 0 ? (
                    "Consider adding some strength training to your routine for a well-rounded fitness plan."
                  ) : progressStats.cardioCount === 0 ? (
                    "Try adding some cardio workouts to improve your heart health and endurance."
                  ) : progressStats.flexibilityCount === 0 ? (
                    "Don't forget flexibility! Adding stretching or yoga can improve your overall fitness."
                  ) : (
                    "You're doing great with a balanced workout routine! Keep it up and consider increasing intensity as you progress."
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-gray-700 rounded-lg p-8 text-center"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">No workout data available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Start by adding workouts to your log!</p>
            </div>
          )}
        </div>
      )}
      
      {/* Debug Tab Content */}
      {activeTab === 'debug' && storageInfo && (
        <div className="mb-6"></div>
          <h3 className="text-xl text-white font-semibold mb-4">Debug & Data Management</h3>
          
          <div className="bg-gray-700 p-4 rounded-lg mb-4"></div>
            <h4 className="text-white text-lg mb-3">Storage Information</h4>
            <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded overflow-auto max-h-32">
              {JSON.stringify(storageInfo, null, 2)}
            </pre>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h5 className="text-white text-sm mb-2">Data Management</h5>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      logMessage('User viewed current data', weeklyData, 'info');
                      const localData = localStorage.getItem('weeklyData');
                      console.log('LocalStorage Data:', localData ? JSON.parse(localData) : null);
                      alert('Storage info logged to console. Open browser developer tools to view.');
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white text-sm py-2 px-3 rounded transition-colors"
                  >
                    Inspect Current Data
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to export your workout data? This will download a JSON file.")) {
                        try {
                          const dataStr = JSON.stringify(weeklyData, null, 2);
                          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                          const exportFileDefaultName = 'workout-data.json';
                          
                          const linkElement = document.createElement('a');
                          linkElement.setAttribute('href', dataUri);
                          linkElement.setAttribute('download', exportFileDefaultName);
                          linkElement.click();
                          
                          logMessage('Data exported successfully', null, 'success');
                        } catch (e) {
                          logMessage('Failed to export data', e, 'error');
                        }
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 px-3 rounded transition-colors"
                  >
                    Export Data
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm("⚠️ WARNING: This will reset all your workout data. This cannot be undone!")) {
                        try {
                          const resetData = { workouts: {}, meals: {}, hydration: 0 };
                          setWeeklyData(resetData);
                          localStorage.setItem('weeklyData', JSON.stringify(resetData));
                          logMessage('Data reset successfully', null, 'success');
                          alert('All workout data has been reset.');
                        } catch (e) {
                          logMessage('Failed to reset data', e, 'error');
                        }
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-500 text-white text-sm py-2 px-3 rounded transition-colors"
                  >
                    Reset All Data
                  </button>
                </div>
              </div>
              
              <div></div>
                <h5 className="text-white text-sm mb-2">Issues & Fixes</h5>
                {debugInfo && (debugInfo.hasDataIssues || debugInfo.needsHydrationFix) ? (
                  <div className="space-y-2">
                    {debugInfo.needsHydrationFix && (
                      <div className="bg-red-900 bg-opacity-30 p-3 rounded">
                        <p className="text-red-400 text-xs mb-2">
                          ⚠️ Hydration data issue detected
                        </p>
                        <p className="text-gray-300 text-xs mb-3">
                          This is likely causing the Error #31 in React. We recommend fixing this issue.
                        </p>
                        <button
                          onClick={() => {
                            try {
                              const fixedData = {
                                workouts: weeklyData.workouts || {},
                                meals: weeklyData.meals || {},
                                hydration: 0
                              };
                              setWeeklyData(fixedData);
                              localStorage.setItem('weeklyData', JSON.stringify(fixedData));
                              logMessage("Fixed Error #31 by resetting hydration data", null, 'success');
                              alert("Hydration data has been reset to fix the issue.");
                            } catch (e) {
                              logMessage("Failed to fix Error #31", e, 'error');
                            }
                          }}
                          className="w-full bg-red-600 hover:bg-red-500 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          Fix Hydration Error
                        </button>
                      </div>
                    )}
                    
                    {debugInfo.hasDataIssues && (
                      <div className="bg-yellow-900 bg-opacity-30 p-3 rounded">
                        <p className="text-yellow-400 text-xs mb-2">
                          ⚠️ Data structure issues detected
                        </p>
                        <p className="text-gray-300 text-xs mb-3">
                          Some of your workout data may have incorrect formatting.
                        </p>
                        <button
                          onClick={() => {
                            try {
                              // Create a deep copy to avoid reference issues
                              const fixedData = JSON.parse(JSON.stringify(weeklyData || { workouts: {}, meals: {}, hydration: 0 }));
                              
                              // Fix workouts structure
                              if (fixedData.workouts) {
                                Object.entries(fixedData.workouts).forEach(([key, value]) => {
                                  if (!Array.isArray(value)) {
                                    fixedData.workouts[key] = [];
                                  }
                                });
                              } else {
                                fixedData.workouts = {};
                              }
                              
                              setWeeklyData(fixedData);
                              localStorage.setItem('weeklyData', JSON.stringify(fixedData));
                              logMessage("Fixed workout data structure issues", null, 'success');
                              alert("Workout data structure has been fixed.");
                            } catch (e) {
                              logMessage("Failed to fix data structure", e, 'error');
                            }
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-500 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          Fix Data Structure
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-900 bg-opacity-30 p-3 rounded">
                    <p className="text-green-400 text-xs flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No data issues detected
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* App Logs */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-white text-lg">Application Logs</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogs([])}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                >
                  Clear Logs
                </button>
                <button
                  onClick={() => {
                    logMessage('Test log message', { test: 'This is a test' }, 'info');
                    logMessage('Test warning', null, 'warn');
                    logMessage('Test error', new Error('Sample error'), 'error');
                  }}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                >
                  Test Logs
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 p-2 rounded overflow-auto max-h-64">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`mb-2 p-2 rounded text-xs ${
                      log.type === 'error' ? 'bg-red-900 bg-opacity-20' : 
                      log.type === 'warn' ? 'bg-yellow-900 bg-opacity-20' : 
                      log.type === 'success' ? 'bg-green-900 bg-opacity-20' :
                      'bg-blue-900 bg-opacity-10'
                    }`}
                  >
                    <div className="font-mono text-gray-500">{log.timestamp}</div>
                    <div className={
                      log.type === 'error' ? 'text-red-400' : 
                      log.type === 'warn' ? 'text-yellow-400' : 
                      log.type === 'success' ? 'text-green-400' :
                      'text-blue-400'
                    }></div>
                      {log.message}
                    </div>
                    {log.data && <pre className="overflow-x-auto whitespace-pre-wrap mt-1 text-gray-400 bg-gray-900 p-1 rounded">{log.data}</pre>}
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4 text-sm">No logs yet</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer info section - always visible */}
      <div className="bg-gray-700 mt-6 p-3 rounded text-sm text-gray-400">
        <p className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Your workout data is stored locally in your browser. 
            {activeTab !== 'debug' && (
              <button 
                onClick={() => setActiveTab('debug')} 
                className="text-blue-400 hover:underline ml-1"
              >
                Manage data
              </button>
            )}
          </span>
        </p>
      </div>
    </div>
  );
}
