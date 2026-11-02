import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/api.js";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const handleSave = async (e) => {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const res = await api.put("/users/me", form);

      const updatedUser = res.data.data.user;

      setUser(updatedUser);

      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel narrow">
      <h1>Profile Settings</h1>

      <form className="form" onSubmit={handleSave}>
        {/* Name */}
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </label>

        {/* Bio */}
        <label>
          Bio
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Write something about yourself"
          />
        </label>

        {/* Avatar URL */}
        <label>
          Avatar URL
          <input
            type="text"
            name="avatarUrl"
            value={form.avatarUrl}
            onChange={handleChange}
            placeholder="Enter profile image URL"
          />
        </label>

        {/* Save Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {/* Success or Error Message */}
      {message && <p>{message}</p>}
    </section>
  );
};

export default Profile;
