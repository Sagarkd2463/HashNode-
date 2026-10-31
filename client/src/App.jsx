import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Article from "./pages/Article.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";
import NotFound from "./pages/NotFound.jsx";
import Profile from "./pages/Profile.jsx";
import Register from "./pages/Register.jsx";
import Tags from "./pages/Tags.jsx";
import TagFeed from "./pages/TagFeed.jsx";

const App = () => {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:slug" element={<Article />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/tags/:slug" element={<TagFeed />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-post" element={<Editor />} />
            <Route path="/edit-post/:id" element={<Editor />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
