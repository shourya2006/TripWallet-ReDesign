import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/app");
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
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Please sign in to your account
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full px-4 py-3 bg-white/5 border border-white/10 placeholder-white/30 text-white focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300 rounded-lg sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 bg-transparent border-white/20 rounded text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-white/60 cursor-pointer select-none"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-white/60 hover:text-white transition-colors"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-white/20 text-sm font-medium text-white hover:border-white transition-colors duration-300 cursor-pointer rounded-lg"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-white/60">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-white hover:text-white/80 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
