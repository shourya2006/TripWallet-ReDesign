import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col relative z-10 overflow-hidden bg-dark text-white selection:bg-white/20">
      <nav className="flex justify-between items-center px-8 py-6 md:px-16 z-20 backdrop-blur-sm fixed top-0 w-full border-b border-white/5">
        <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Trip Wallet
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link
            to="/login"
            className="px-6 py-2 text-sm font-medium text-white border border-white/20 hover:border-white transition-colors duration-300 cursor-pointer"
          >
            Login
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 gap-12 z-20 py-32 md:py-40 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight animate-fade-in-down [animation-delay:200ms] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent drop-shadow-2xl">
            Travel More,
            <br />
            <span className="italic font-serif text-white/90">Worry Less.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto animate-fade-in-down [animation-delay:400ms]">
            Track expenses, split bills, and manage your travel budget
            effortlessly. The only wallet you need for your next adventure.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center animate-fade-in-down [animation-delay:600ms]">
          <Link
            to="/signup"
            className="px-10 py-4 text-lg font-semibold text-white border border-white/20 hover:border-white transition-colors duration-300 cursor-pointer"
          >
            Get Started Free
          </Link>
        </div>

        <div className="relative mt-16 group perspective-1000">
          <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 w-[340px] shadow-2xl transition-transform duration-500 group-hover:rotate-x-2 group-hover:rotate-y-2">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col items-start">
                <span className="text-xs text-white/50 uppercase tracking-wider">
                  Current Trip
                </span>
                <span className="text-lg font-semibold">Tokyo Adventure</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                    🍣
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Sushi Dinner</span>
                    <span className="text-xs text-white/40">Just now</span>
                  </div>
                </div>
                <span className="font-semibold text-white group-hover/item:text-orange-300 transition-colors">
                  -$50.00
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group/item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    🚕
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Uber to Hotel</span>
                    <span className="text-xs text-white/40">2 hours ago</span>
                  </div>
                </div>
                <span className="font-semibold text-white group-hover/item:text-blue-300 transition-colors">
                  -$24.50
                </span>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

            <div className="flex justify-between items-end">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 overflow-hidden"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] text-white/60">
                  +2
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/50 block mb-1">
                  Total Spent
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  $1,240.50
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>
    </div>
  );
};

export default LandingPage;
