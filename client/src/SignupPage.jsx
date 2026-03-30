import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark text-white selection:bg-white/20 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <Link
            to="/"
            className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Trip Wallet
          </Link>
          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Start tracking your expenses today
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-white/30 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 rounded-lg sm:text-sm"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-white/30 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 rounded-lg sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-white/30 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 rounded-lg sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium text-white hover:border-white transition-colors duration-300 cursor-pointer rounded-lg"
            >
              Sign up
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-white hover:text-white/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
