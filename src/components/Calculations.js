// calculations.js

/**
 * Calculate suggested daily goals based on age, weight, and activity
 * @param {number} weightLbs
 * @returns {object} goals {calories, proteinGrams, waterCups}
 */
export function getDailyGoals(weightLbs) {
  const calories = 2500; // Active teen male baseline
  const proteinGrams = Math.round(weightLbs * 0.9); // ~1g/lb
  const waterCups = 10; // 2.4L, approx 10 cups
  return { calories, proteinGrams, waterCups };
}

/**
 * Summarize totals from a given weeklyData object
 * @param {object} weeklyData
 * @returns {object} { totalCalories, avgProtein, waterTotal }
 */
export function summarizeWeek(weeklyData) {
  let totalCalories = 0;
  let totalProtein = 0;
  let waterTotal = 0;
  let dayCount = 0;

  for (const day of Object.values(weeklyData)) {
    if (day.nutrition || day.hydration) {
      totalCalories += Number(day.nutrition?.calories || 0);
      totalProtein += Number(day.nutrition?.protein || 0);
      waterTotal += Number(day.hydration?.cups || 0);
      dayCount++;
    }
  }

  return {
    totalCalories,
    avgProtein: dayCount ? Math.round(totalProtein / dayCount) : 0,
    waterTotal
  };
}
