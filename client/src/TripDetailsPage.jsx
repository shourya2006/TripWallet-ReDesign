import React, { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import { X, Search } from "lucide-react";

const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    type: null,
    message: "",
    data: null,
  });
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });

  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [friendSearchResults, setFriendSearchResults] = useState([]);
  const [isSearchingFriends, setIsSearchingFriends] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchTripData = async () => {
    try {
      const token = localStorage.getItem("token");

      const tripRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (tripRes.ok) {
        const data = await tripRes.json();
        setTrip(data);
        setEditForm(data);
      } else {
        console.error("Failed to fetch trip:", tripRes.status);
        navigate("/trips");
        return;
      }

      const expRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        const updatedTrip = await response.json();
        setTrip(updatedTrip);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating trip:", error);
    }
  };

  const handleDeleteTrip = () => {
    setConfirmation({
      isOpen: true,
      type: "delete",
      message:
        "Are you sure you want to delete this trip? This action cannot be undone.",
      data: null,
    });
  };

  const confirmDeleteTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        navigate("/app");
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const handleLeaveTrip = () => {
    setConfirmation({
      isOpen: true,
      type: "leave",
      message: "Are you sure you want to leave this trip?",
      data: null,
    });
  };

  const confirmLeaveTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}/leave`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        navigate("/app");
      }
    } catch (error) {
      console.error("Error leaving trip:", error);
    }
  };

  const handleSettleExpense = (expenseId) => {
    setConfirmation({
      isOpen: true,
      type: "settle",
      message: "Are you sure you want to settle (delete) this expense?",
      data: expenseId,
    });
  };

  const confirmSettleExpense = async (expenseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${expenseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        fetchTripData();
      }
    } catch (error) {
      console.error("Error settling expense:", error);
    }
  };

  const handleConfirmAction = () => {
    if (confirmation.type === "delete") {
      confirmDeleteTrip();
    } else if (confirmation.type === "leave") {
      confirmLeaveTrip();
    } else if (confirmation.type === "settle") {
      confirmSettleExpense(confirmation.data);
    }
    setConfirmation({ isOpen: false, type: null, message: "", data: null });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newExpense,
            tripId: id,
          }),
        }
      );

      if (response.ok) {
        setIsExpenseModalOpen(false);
        setNewExpense({ description: "", amount: "", paidBy: "" });
        fetchTripData();
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleSearchFriends = async (query) => {
    setFriendSearchQuery(query);
    if (query.length < 2) {
      setFriendSearchResults([]);
      return;
    }

    setIsSearchingFriends(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();

        const filtered = data.filter(
          (u) => !trip.participants.some((p) => p._id === u._id)
        );
        setFriendSearchResults(filtered);
      }
    } catch (error) {
      console.error("Error searching friends:", error);
    } finally {
      setIsSearchingFriends(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        setToast({ message: "Invitation sent successfully!", type: "success" });
        setIsAddFriendModalOpen(false);
        setFriendSearchQuery("");
        setFriendSearchResults([]);
      } else {
        const data = await response.json();
        setToast({
          message: data.msg || "Failed to send invitation",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error adding friend:", error);
      setToast({ message: "Error sending invitation", type: "error" });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  if (!trip)
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        Trip not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20 relative">
      <Navbar />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="px-8 py-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/trips"
            className="text-white/40 hover:text-white text-sm mb-4 inline-block"
          >
            ← Back to Trips
          </Link>

          {isEditing ? (
            <form
              onSubmit={handleUpdate}
              className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-2xl"
            >
              <h2 className="text-2xl font-serif mb-6">Edit Trip Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">
                    Dates
                  </label>
                  <input
                    type="text"
                    value={editForm.date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                    className="w-full bg-black/20 border border-white/10 rounded px-4 py-2"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-white text-black px-6 py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-white/60 hover:text-white px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-serif mb-2">{trip.title}</h1>
                <p className="text-xl text-white/60">{trip.date}</p>
              </div>
              <div className="flex gap-4">
                {(!trip.endDate ||
                  new Date(trip.endDate) >=
                    new Date().setHours(0, 0, 0, 0)) && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Edit Details
                  </button>
                )}
                {trip.createdBy === user?._id ? (
                  <button
                    onClick={handleDeleteTrip}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Delete Trip
                  </button>
                ) : (
                  <button
                    onClick={handleLeaveTrip}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded text-sm transition-colors"
                  >
                    Leave Trip
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Expenses</h2>
                {(!trip.endDate ||
                  new Date(trip.endDate) >=
                    new Date().setHours(0, 0, 0, 0)) && (
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="text-sm bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
                  >
                    + Add Expense
                  </button>
                )}
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-12 text-white/40 border border-dashed border-white/10 rounded-lg">
                  No expenses added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                          💰
                        </div>
                        <div>
                          <div className="font-medium">
                            {expense.description}
                          </div>
                          <div className="text-sm text-white/40">
                            Paid by {expense.paidBy} •{" "}
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-medium">
                          ₹{expense.amount.toLocaleString()}
                        </div>
                        {expense.createdBy === user?._id && (
                          <button
                            onClick={() => handleSettleExpense(expense._id)}
                            className="text-xs bg-white/10 hover:bg-red-500/20 hover:text-red-500 text-white/60 px-3 py-1.5 rounded transition-colors"
                          >
                            Settle
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Budget</span>
                  <span>₹{trip.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Friends</h3>
                <button
                  onClick={() => setIsAddFriendModalOpen(true)}
                  className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {trip.participants &&
                  trip.participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                        {p.username ? p.username.charAt(0).toUpperCase() : "?"}
                      </div>
                      <span>{p.username || "Unknown"}</span>
                    </div>
                  ))}
                {(!trip.participants || trip.participants.length === 0) && (
                  <div className="text-white/40 text-sm">
                    No participants added.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsExpenseModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif">Add Expense</h2>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Dinner at Mario's"
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Paid By</label>
                <select
                  value={newExpense.paidBy}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, paidBy: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-white/30 transition-colors appearance-none"
                  required
                >
                  <option value="" disabled>
                    Select person
                  </option>
                  {trip.participants &&
                    trip.participants.map((p, i) => (
                      <option key={i} value={p.username}>
                        {p.username}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-medium py-3 rounded-full hover:bg-gray-200 transition-colors mt-4"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
      {confirmation.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl">
            <h3 className="text-xl font-serif mb-4">Confirm Action</h3>
            <p className="text-white/60 mb-8">{confirmation.message}</p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() =>
                  setConfirmation({
                    isOpen: false,
                    type: null,
                    message: "",
                    data: null,
                  })
                }
                className="text-white/60 hover:text-white px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddFriendModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsAddFriendModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif">Add Friend</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={friendSearchQuery}
                  onChange={(e) => handleSearchFriends(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {friendSearchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAddFriend(user._id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group text-left"
                  >
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-white/40">{user.email}</div>
                    </div>
                    <span className="text-white/40 group-hover:text-white transition-colors">
                      + Add
                    </span>
                  </button>
                ))}
                {friendSearchQuery.length >= 2 &&
                  friendSearchResults.length === 0 &&
                  !isSearchingFriends && (
                    <div className="text-center text-white/40 py-4">
                      No users found
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripDetailsPage;
