import React, { useState } from "react";
import Navbar from "./components/Navbar";

const SettingsPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      if (response.ok) {
        setMessage("Password updated successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await response.text();
        setError(data);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20">
      <Navbar />

      <main className="px-8 py-12 max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif mb-8">Settings</h1>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-xl font-medium mb-6">Change Password</h2>

          {message && (
            <div className="bg-green-500/10 text-green-500 p-3 rounded mb-4 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-black/20 border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors font-medium mt-2"
            >
              Update Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
