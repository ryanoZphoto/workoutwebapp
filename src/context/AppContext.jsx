// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [weeklyData, setWeeklyData] = useState(() => {
    const saved = localStorage.getItem('weeklyData');
    return saved ? JSON.parse(saved) : {
      workouts: {},
      meals: {},
      hydration: [],
      goals: {
        workoutDays: 4,
        calories: 2000,
        protein: 150,
        waterIntake: 2000,
      },
      history: {
        previousWeeks: []
      },
      userInfo: {
        weight: 70,  // kg
        height: 170, // cm
        age: 30,
        gender: 'male',
        activityLevel: 'moderate'
      }
    };
  });
  
  // Track whether workout reminders are enabled
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      workoutDays: ['monday', 'wednesday', 'friday'],
      workoutTime: '18:00',
      hydrationReminders: true,
      hydrationInterval: 60, // minutes
    };
  });
  
  // Store user preferences
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('preferences');
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      measurementSystem: 'metric',
      shareProgress: false,
      showRecommendations: true
    };
  });

  useEffect(() => {
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
  }, [weeklyData]);
  
  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);
  
  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Function to archive current week's data and start a new week
  const archiveAndReset = () => {
    setWeeklyData(prevData => {
      const newHistory = {
        ...prevData.history,
        previousWeeks: [
          {
            date: new Date().toISOString(),
            workouts: prevData.workouts,
            meals: prevData.meals,
            hydration: prevData.hydration
          },
          ...prevData.history.previousWeeks
        ]
      };
      
      return {
        ...prevData,
        workouts: {},
        meals: {},
        hydration: [],
        history: newHistory
      };
    });
  };
  
  // Auto-generate workout suggestions based on user data
  const generateWorkoutSuggestions = () => {
    // Implementation would analyze user data and goals
    // to create personalized workout recommendations
    return [
      { type: 'strength', name: 'Upper Body Focus', duration: 45, intensity: 7 },
      { type: 'cardio', name: 'HIIT Session', duration: 30, intensity: 8 },
      { type: 'flexibility', name: 'Yoga Flow', duration: 40, intensity: 5 }
    ];
  };
  
  // Calculate nutrition needs based on user info and goals
  const calculateNutritionNeeds = () => {
    const { weight, height, age, gender, activityLevel } = weeklyData.userInfo;
    let bmr;
    
    // Calculate BMR (Basal Metabolic Rate)
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };
    
    const calorieNeeds = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
    
    return {
      calories: calorieNeeds,
      protein: Math.round(weight * 2), // 2g per kg of bodyweight
      carbs: Math.round(calorieNeeds * 0.45 / 4), // 45% of calories from carbs
      fat: Math.round(calorieNeeds * 0.25 / 9) // 25% of calories from fat
    };
  };
  
  return (
    <AppContext.Provider value={{ 
      weeklyData, 
      setWeeklyData,
      reminders,
      setReminders,
      preferences,
      setPreferences,
      archiveAndReset,
      generateWorkoutSuggestions,
      calculateNutritionNeeds
    }}>
      {children}
    </AppContext.Provider>
  );
};
