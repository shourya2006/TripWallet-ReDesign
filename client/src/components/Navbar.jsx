import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Bell } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error(`Error ${action} notification:`, error);
    }
  };

  const pendingCount = notifications.filter(
    (n) => n.status === "PENDING"
  ).length;

  return (
    <header className="flex justify-between items-center px-8 py-6 border-b border-white/10 relative">
      <div className="text-xl font-medium tracking-tight">Trip Wallet</div>
      <nav className="hidden md:flex gap-8 text-sm text-white/60">
        <Link to="/app" className="hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link to="/trips" className="hover:text-white transition-colors">
          Trips
        </Link>
        <Link to="/settings" className="hover:text-white transition-colors">
          Settings
        </Link>
      </nav>
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-white/60 hover:text-white relative"
          >
            <Bell className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-4 w-80 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-medium">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-white/40 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className="text-sm mb-2">
                        <span className="font-medium text-white">
                          {n.sender.username}
                        </span>{" "}
                        invited you to{" "}
                        <span className="font-medium text-white">
                          {n.tripId?.title || "a trip"}
                        </span>
                      </div>
                      {n.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(n._id, "accept")}
                            className="bg-white text-black text-xs px-3 py-1 rounded hover:bg-gray-200"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(n._id, "reject")}
                            className="text-white/60 hover:text-white text-xs px-3 py-1"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-white/40 capitalize">
                          {n.status.toLowerCase()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60 hidden sm:block">
            {user?.username}
          </span>
          <button
            onClick={logout}
            className="text-sm hover:text-white/80 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
