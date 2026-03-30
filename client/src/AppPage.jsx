import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Ticket, X, MapPin, Search } from "lucide-react";

const AppPage = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const [newTrip, setNewTrip] = useState({
    title: "",
    startDate: "",
    endDate: "",
    participants: [],
  });
  const [participantInput, setParticipantInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [balance, setBalance] = useState({ toPay: 0, toReceive: 0 });

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTrips(data);
        } else if (data.trips && Array.isArray(data.trips)) {
          setTrips(data.trips);
        } else {
          setTrips([]);
        }
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/balance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setBalance(data);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
    fetchBalance();
  }, []);

  const openModal = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setNewTrip({
      title: "",
      startDate: formatDate(today),
      endDate: formatDate(tomorrow),
      participants: [],
    });
    setSelectedFriends([]);
    setSearchResults([]);
    setParticipantInput("");
    setIsModalOpen(true);
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (isCreating) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");

      const start = new Date(newTrip.startDate);
      const end = new Date(newTrip.endDate);
      const options = { month: "short", day: "2-digit" };
      const dateString = `${start.toLocaleDateString(
        "en-US",
        options
      )} - ${end.toLocaleDateString("en-US", options)}, ${end.getFullYear()}`;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTrip.title,
            date: dateString,
            startDate: newTrip.startDate,
            endDate: newTrip.endDate,
            participants: selectedFriends.map((f) => f._id),
          }),
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        fetchTrips();
        fetchBalance();
      }
    } catch (error) {
      console.error("Error creating trip:", error);
    } finally {
      setIsCreating(false);
    }
  };

  <button
    type="submit"
    disabled={isCreating}
    className="w-full bg-white text-black font-medium py-3 rounded-full hover:bg-gray-200 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isCreating ? "Creating..." : "Create Trip"}
  </button>;

  const handleSearchFriends = async (query) => {
    setParticipantInput(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/search?query=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const filtered = data.filter(
          (u) => !selectedFriends.some((f) => f._id === u._id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error("Error searching friends:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addParticipant = (user) => {
    if (user && !selectedFriends.some((f) => f._id === user._id)) {
      setSelectedFriends([...selectedFriends, user]);
      setParticipantInput("");
      setSearchResults([]);
    }
  };

  const removeParticipant = (userId) => {
    setSelectedFriends(selectedFriends.filter((f) => f._id !== userId));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20 relative">
      <Navbar />

      <main className="px-8 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <h1 className="text-7xl md:text-8xl font-serif tracking-tighter">
            Trip Wallet
          </h1>

          <div className="flex gap-4">
            <div className="bg-[#1a2e26] border border-[#2d4a3e] rounded-xl p-4 w-40">
              <div className="text-xs text-[#4ade80] mb-1 flex items-center gap-1">
                <span>↓</span> To Receive
              </div>
              <div className="text-3xl font-medium">
                ₹{balance.toReceive.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#2e1a1a] border border-[#4a2d2d] rounded-xl p-4 w-40">
              <div className="text-xs text-[#f87171] mb-1 flex items-center gap-1">
                <span>↑</span> To Pay
              </div>
              <div className="text-3xl font-medium">
                ₹{balance.toPay.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12"></div>

        <div className="flex justify-center mb-20">
          <button
            onClick={openModal}
            className="group relative bg-white text-black px-8 py-4 rounded-sm font-medium tracking-wide hover:bg-gray-200 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] rounded-full"></span>
            <span className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] rounded-full"></span>
            CREATE NEW TRIP
            <Ticket className="w-5 h-5" />
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-medium mb-8 text-center md:text-left">
            Recent Journeys
          </h2>

          {loading ? (
            <div className="text-center text-white/60">Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <p className="text-white/60 mb-4">No trips created yet.</p>
              <p className="text-sm text-white/40">
                Click the button above to start your first journey!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trips.slice(0, 10).map((trip) => (
                <div key={trip._id} className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-white/5 relative">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="font-serif text-lg leading-tight mb-1">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-white/40 mb-3">{trip.date}</p>

                  <div className="flex justify-between items-end text-sm">
                    <div>
                      <div className="text-white/40 text-xs">Total:</div>
                      <div>₹{trip.total.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <div className="text-sm text-white/60 mb-2">Create Trip</div>
              <h2 className="text-3xl font-serif">Plan a New Journey</h2>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Destination"
                    value={newTrip.title}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, title: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, startDate: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, endDate: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Add Friends</label>
                <div className="relative">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={participantInput}
                      onChange={(e) => handleSearchFriends(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          onClick={() => addParticipant(user)}
                          className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors flex flex-col"
                        >
                          <span className="font-medium">{user.username}</span>
                          <span className="text-xs text-white/60">
                            {user.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedFriends.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFriends.map((friend) => (
                      <div
                        key={friend._id}
                        className="bg-white/10 rounded-full px-3 py-1 text-sm flex items-center gap-2"
                      >
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                        {friend.username}
                        <button
                          type="button"
                          onClick={() => removeParticipant(friend._id)}
                          className="text-white/40 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-white/40">
                  {selectedFriends.length} friends selected
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-white text-black font-medium py-3 rounded-full hover:bg-gray-200 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Trip"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppPage;
