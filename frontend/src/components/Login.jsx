import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthError("");
    setSuccessMessage("");

    if (!email || !password) {
      setAuthError("Please fill in both fields");
      return;
    }

    try {
      const response = await fetch("https://crossdomain-recommender-production.up.railway.app//user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        console.log('Logged in name:', data.name);
        console.log('Loggen in gender: ', data.gender);
        // Save user details to localStorage
        localStorage.setItem("username", data.name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("gender", data.gender);
        localStorage.setItem("isLoggedIn", "true");

        setSuccessMessage("Login successful! Redirecting to Home...");
        setTimeout(() => navigate("/home"), 2000);
      } else {
        const error = await response.json();
        setAuthError(error.detail || "Invalid email or password");
      }
    } catch (error) {
      setAuthError("Server error. Please try again.");
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side branding */}
      <div
        className="w-9/12 bg-cover bg-center relative hidden md:block"
        style={{
          backgroundImage:
            'url("https://wallpapercrafter.com/desktop/207824-fruit-food-healthy-and-cheese-hd.jpg")',
        }}
      >
        <h1 className="text-white text-5xl font-bold text-center leading-snug absolute bottom-20 left-1/2 transform -translate-x-1/2">
          A Healthwise Plan
        </h1>
      </div>

      {/* Right side form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-10 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your registered email and password
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Email
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
                  emailError
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-green-400"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                placeholder="Enter your email"
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-150 ease-in-out"
            >
              Sign In
            </button>

            {/* Error */}
            {authError && (
              <p className="text-red-600 mt-4 text-sm text-center font-semibold">
                {authError}
              </p>
            )}

            {/* Success */}
            {successMessage && (
              <p className="text-green-600 mt-4 text-sm text-center font-semibold">
                {successMessage}
              </p>
            )}
          </form>

          <div className="mt-6 text-sm text-center">
            If not registered?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-green-600 font-semibold hover:underline"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
