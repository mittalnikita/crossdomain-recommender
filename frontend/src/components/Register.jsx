import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    termsAccepted: false,
  });

  formData.email = formData.email.trim().toLowerCase();


  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const validateEmail = (email) =>
    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.age || isNaN(formData.age))
      newErrors.age = 'Valid age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.termsAccepted)
      newErrors.termsAccepted = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStrength = (pwd) => {
    if (pwd.length > 9 && /[A-Z]/.test(pwd) && /\W/.test(pwd)) {
      setPasswordStrength('Strong');
    } else if (pwd.length > 6) {
      setPasswordStrength('Moderate');
    } else {
      setPasswordStrength('Weak');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
      setFormData({ ...formData, [name]: val });
    if (name === 'password') handleStrength(val);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log("submit fired");


    try {
      const res = await fetch('https://crossdomain-recommender-production-4785.up.railway.app/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          age: Number(formData.age),
          gender: formData.gender
        })

      });

    const data = await res.json();
    console.log(data)

    if (!res.ok) {
      if (data.detail === "Email already registered") {
        setErrors({ email: 'Email already exists' });
        return;
      } else {
        alert("Registration failed.");
        return;
      }
    }

    setSuccessMessage('Registration successful! Redirecting to login...');
    setTimeout(() => navigate('/login'), 2000);

  } 
  catch (err) {
    console.error("Registration Error:", err);
    alert("Something went wrong. Try again.");
  }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-4xl font-semibold mb-6 text-center">Create an Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="w-full p-2 border rounded"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-gray-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {passwordStrength && (
            <p
              className={`text-sm ${
                passwordStrength === 'Strong'
                  ? 'text-green-600'
                  : passwordStrength === 'Moderate'
                  ? 'text-yellow-600'
                  : 'text-red-500'
              }`}
            >
              Password Strength: {passwordStrength}
            </p>
          )}
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-2 border rounded"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
          )}

          <input
            type="number"
            name="age"
            placeholder="Age"
            className="w-full p-2 border rounded"
            value={formData.age}
            onChange={handleChange}
          />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

          <select
            name="gender"
            className="w-full p-2 border rounded"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}

          <label className="flex items-center">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">
              I agree to the{' '}
              <a href="#" className="text-blue-500 underline">
                Terms & Conditions
              </a>
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-red-500 text-sm">{errors.termsAccepted}</p>
          )}

          <button
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Register
          </button>

          {successMessage && (
            <p className="text-green-600 text-center mt-2">{successMessage}</p>
          )}
        </form>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;