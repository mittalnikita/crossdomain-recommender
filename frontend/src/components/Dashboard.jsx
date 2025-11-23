// src/Dashboard.jsx
import React, { useState, useEffect } from "react";
import yogaImageMap from "./yogaImageMap";
import Header from "./Header";

// === Helpers ===
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  return "dinner";
};

const getCurrentDay = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
};

const getCurrentWeek = () => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const diff = (new Date() - start) / (1000 * 60 * 60 * 24);
  return Math.ceil((diff + start.getDay() + 1) / 7);
};

// Extract Yoga pose names for images
const extractYogaPoseNames = (yogaString) => {
  if (!yogaString) return [];
  return yogaString
    .split(";")
    .map((part) => {
      const match = part.match(/^([^()]+?)(\s*\([^)]*\))?$/);
      return match?.[1]?.trim();
    })
    .filter(Boolean);
};

// SELECTED NUTRIENTS to show
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

const Dashboard = () => {
  const [toggle, setToggle] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [jsonData, setJsonData] = useState([]);

  const realTime = getTimeOfDay();
  const realDay = getCurrentDay();

  const [timeSlot, setTimeSlot] = useState(realTime);
  const [dayName, setDayName] = useState(realDay);

  const [hasMovedToNext, setHasMovedToNext] = useState(false);

  const timeOrder = ["breakfast", "lunch", "dinner"];

  // === Load the JSON data ===
  useEffect(() => {
    const loadData = async () => {
      const disease = localStorage.getItem("disease")?.toLowerCase();
      const week = getCurrentWeek();

      const file =
        week % 2 === 1
          ? "/gpt_weekly_recommendations.json"
          : "/gemini_weekly_recommendations.json";

      try {
        const res = await fetch(file);
        const json = await res.json();

        const filtered = json.filter(
          (item) => item.disease.toLowerCase() === disease
        );

        setJsonData(filtered);

        const initial = filtered.find(
          (item) =>
            item.day.toLowerCase() === realDay.toLowerCase() &&
            item.time.toLowerCase() === realTime
        );

        setData(initial || filtered[0] || null);
        setLoading(false);
      } catch (e) {
        console.error("JSON Load Error:", e);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // === Navigation: Next Plan ===
  const handleNextPlan = () => {
    if (hasMovedToNext) return;

    const idx = timeOrder.indexOf(timeSlot);

    let newTime, newDay;

    if (idx < 2) {
      newTime = timeOrder[idx + 1];
      newDay = dayName;
    } else {
      // Move to next day’s breakfast
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      newTime = "breakfast";
      newDay = days[(days.indexOf(dayName) + 1) % 7];
    }

    setTimeSlot(newTime);
    setDayName(newDay);

    const next = jsonData.find(
      (i) =>
        i.day.toLowerCase() === newDay.toLowerCase() &&
        i.time.toLowerCase() === newTime
    );

    setData(next || {});
    setHasMovedToNext(true);
  };

  // === Back to current plan ===
  const handleBackToCurrent = () => {
    setTimeSlot(realTime);
    setDayName(realDay);

    const curr = jsonData.find(
      (i) =>
        i.day.toLowerCase() === realDay.toLowerCase() &&
        i.time.toLowerCase() === realTime
    );

    setData(curr || {});
    setHasMovedToNext(false);
  };

  // === Build Nutrient List Dynamically ===
  const buildNutrients = (item, isAlt = false) => {
    const prefix = isAlt ? "alternative_" : "";
    return SELECTED_NUTRIENTS.map((nut) => ({
      label: nut.replace(/_/g, " "),
      value: item[prefix + nut] || "-",
    }));
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">Loading recommendations...</p>
      </div>
    );
  }

  const isAlt = toggle;

  // === Using natural JSON fields ===
  const mealName = isAlt ? data.alternative_meal_name : data.meal_name;
  const mealDesc = isAlt
    ? data.alternative_meal_description
    : data.meal_description;

  const nutrients = buildNutrients(data, isAlt);

  const yogaPose = isAlt ? data.alternative_yoga : data.yoga;
  const yogaExercise = isAlt ? data.alternative_exercise : data.exercise;
  const yogaPrecaution = isAlt
    ? data.alternative_precaution
    : data.precaution;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-100 p-5 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-blue-700">HealthWise Dashboard</h1>
        <p className="text-center mb-8 text-gray-500">
          Personalized recommendations to help manage your health levels.
        </p>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* YOGA CARD */}
          <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-green-700 text-center">
              Yoga & Exercise
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {extractYogaPoseNames(yogaPose).map((pose, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={yogaImageMap[pose.toLowerCase()] || yogaImageMap["default"]}
                    alt={pose}
                    className="w-32 h-32 object-contain rounded-md shadow"
                  />
                  <p className="mt-2 text-sm text-center font-medium text-gray-700">
                    {pose}
                  </p>
                </div>
              ))}
            </div>

            <p>
              <b>Pose:</b> {yogaPose}
            </p>
            <p>
              <b>Exercise:</b> {yogaExercise}
            </p>
            <p>
              <b>Precaution:</b> {yogaPrecaution}
            </p>
          </div>

          {/* MEAL CARD */}
          <div
            className="relative shadow-xl rounded-2xl p-6 w-full md:w-1/2 bg-white overflow-hidden"
            style={{
              backgroundImage: `url('/images/meal-bg.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-2xl"></div>

            <div className="relative z-10 text-white space-y-3">
              <h2 className="text-2xl font-bold text-center">Meal Plan</h2>

              <h3 className="text-xl font-semibold">
                <span className="text-gray-200">Meal:</span> {mealName}
              </h3>

              <p className="italic text-gray-50">{mealDesc}</p>

              <p className="mt-3">
                <span className="font-bold text-gray-200">Meal Type:</span>{" "}
                {data.time}
              </p>

              {/* NUTRIENT LIST */}
              <div className="bg-white bg-opacity-90 p-4 rounded-lg mt-4 text-black">
                <h4 className="font-bold text-lg mb-3">Nutrients</h4>

                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {nutrients.map((n, i) => (
                    <li key={i} className="text-sm bg-gray-100 p-2 rounded">
                      <b>{n.label}: </b>
                      {n.value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setToggle(!toggle)}
            className="bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:scale-105 transition"
          >
            {toggle ? "Show Main Plan" : "Show Alternative Plan"}
          </button>

          {!hasMovedToNext && (
            <button
              onClick={handleNextPlan}
              className="bg-green-600 text-white px-5 py-2 rounded-md shadow hover:scale-105 transition"
            >
              Next Plan →
            </button>
          )}

          {hasMovedToNext && (
            <button
              onClick={handleBackToCurrent}
              className="bg-gray-700 text-white px-5 py-2 rounded-md shadow hover:scale-105 transition"
            >
              Back to Current Plan
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
