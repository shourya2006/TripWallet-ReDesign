import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

const TripsPage = () => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ongoing");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrips, setTotalTrips] = useState(0);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const params = new URLSearchParams({
          page,
          limit: 12,
          search,
          sortBy,
          sortOrder,
          status: activeTab,
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/trips?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips);
          setTotalPages(data.totalPages);
          setTotalTrips(data.totalTrips);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchTrips();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeTab, page, search, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20">
      <Navbar />

      <main className="px-8 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-serif">Your Trips</h1>

          <div className="flex bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("ongoing")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "ongoing"
                  ? "bg-white text-black shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "past"
                  ? "bg-white text-black shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 text-sm placeholder:text-white/20"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-3 text-sm focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 cursor-pointer hover:bg-white/5"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
                <option value="total">Total Cost</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="bg-white/5 border border-white/10 rounded-full w-12 h-11 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/60 hover:text-white"
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white/60">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <p className="text-white/60 mb-4">No {activeTab} trips found.</p>
            {activeTab === "ongoing" && (
              <Link to="/app" className="text-white underline">
                Create a new trip
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {trips.map((trip) => (
                <Link
                  to={`/trips/${trip._id}`}
                  key={trip._id}
                  className="group block"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 bg-white/5 relative">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="font-serif text-lg leading-tight mb-1 group-hover:underline">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-white/40 mb-3">{trip.date}</p>

                  <div className="flex justify-between items-end text-sm">
                    <div>
                      <div className="text-white/40 text-xs">Total:</div>
                      <div>₹{trip.total.toLocaleString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-white/60">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TripsPage;
