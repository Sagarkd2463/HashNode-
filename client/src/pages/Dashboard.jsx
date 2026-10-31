import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    const getUser = async () => {
      try {
        const response = await api.get("/auth/me");

        setUser(response.data.data.user);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
      }
    };

    getUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  if (!user) {
    return <h2>Loading....</h2>;
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>

      <p>Email: {user.email}</p>

      <p>Bio: {user.bio || "No bio added"}</p>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
