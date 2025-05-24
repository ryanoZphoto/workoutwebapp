// src/context/AppContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [weeklyData, setWeeklyData] = useState(() => {
    const saved = localStorage.getItem('weeklyData');
    return saved ? JSON.parse(saved) : {
      workouts: {},
      meals: {},
      hydration: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
  }, [weeklyData]);

  return (
    <AppContext.Provider value={{ weeklyData, setWeeklyData }}>
      {children}
    </AppContext.Provider>
  );
};
