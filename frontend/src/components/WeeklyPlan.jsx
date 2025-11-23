// src/WeeklyPlan.jsx
import React, { useEffect, useState } from "react";
import Header from "./Header";

// Calculate week number
const getCurrentWeek = () => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const diff = (new Date() - start) / (1000 * 60 * 60 * 24);
  return Math.ceil((diff + start.getDay() + 1) / 7);
};

export default function WeeklyPlan() {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  // ========== IMPORTANT ==========
  // Selected nutrients to show (UI friendly)
  const SELECTED_NUTRIENTS = [
    "calories_kcal",
    "protein_g",
    "carbohydrates_g",
    "dietary_fiber_g",
    "total_fat_g",
    "added_sugar_g",
    "vitamin_c_mg",
    "magnesium_mg",
    "selenium_µg",
    "zinc_mg",
  ];

  // Try both main and alternative keys
  const nutrientKeys = React.useMemo(() => {
    const keys = new Set();

    weeklyData.forEach(item => {
      SELECTED_NUTRIENTS.forEach(n => {
        if (item[n] !== undefined) keys.add(n);
        if (item["alternative_" + n] !== undefined)
          keys.add("alternative_" + n);
      });
    });

    return Array.from(keys);
  }, [weeklyData]);

  // Load JSON data
  useEffect(() => {
    const fetchWeeklyData = async () => {
      const disease = localStorage.getItem("disease")?.toLowerCase();
      const week = getCurrentWeek();

      // IMPORTANT: JSON must be in /public/
      const file =
        week % 2 === 1
          ? "/gpt_weekly_recommendations.json"
          : "/gemini_weekly_recommendations.json";

      try {
        const res = await fetch(file);
        const json = await res.json();

        // FIX: match disease exactly from JSON
        const filtered = json.filter(
          item => item.disease?.toLowerCase().trim() === disease
        );

        setWeeklyData(filtered);
        setLoading(false);
      } catch (err) {
        console.error("❌ Weekly plan load failed", err);
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading weekly plan…</p>
      </div>
    );
  }

  // Group data by day
  const groupedByDay = weeklyData.reduce((acc, item) => {
    if (!acc[item.day]) acc[item.day] = [];
    acc[item.day].push(item);
    return acc;
  }, {});

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Weekly Plan
        </h1>

        <div className="space-y-6">
          {Object.keys(groupedByDay).map(day => (
            <div
              key={day}
              className="bg-white shadow-md rounded-lg p-5 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-blue-600 mb-4">
                {day}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border px-3 py-2">Time</th>
                      <th className="border px-3 py-2">Meal</th>
                      <th className="border px-3 py-2">Yoga / Exercise</th>
                      <th className="border px-3 py-2">Precaution</th>

                      {/* Nutrient columns */}
                      {nutrientKeys.map(k => (
                        <th key={k} className="border px-3 py-2 capitalize">
                          {k
                            .replace("alternative_", "Alt ")
                            .replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {groupedByDay[day].map((plan, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 capitalize">
                          {plan.time}
                        </td>

                        <td className="border px-3 py-2">
                          <b>{plan.meal_name}</b>
                          <br />
                          <span className="text-xs text-gray-600 italic">
                            {plan.meal_description}
                          </span>
                        </td>

                        <td className="border px-3 py-2">
                          {plan.yoga}
                          <br />
                          <span className="text-xs text-gray-600">
                            {plan.exercise}
                          </span>
                        </td>

                        <td className="border px-3 py-2">{plan.precaution}</td>

                        {/* Nutrient cells */}
                        {nutrientKeys.map(nKey => (
                          <td key={nKey} className="border px-3 py-2">
                            {plan[nKey] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
