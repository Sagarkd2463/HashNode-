import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      const result = await response.data;

      if (!response.ok) {
        throw new Error(result.message);
      }

      localStorage.setItem("token", result.data.token);

      localStorage.setItem("user", JSON.stringify(result.data.user));

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failure. Try again");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Login</button>

        <p>
          Don't have an account?
          <Link to="/register"> Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
