import { useState, useMemo } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { DataProvider } from "./components/data-provider";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Assistant from "./pages/Assistant";
import Goals from "./pages/Goals";
import { 
  Footprints, 
  Brain, 
  Target, 
  LineChart, 
  ArrowRight, 
  Globe, 
  Gauge,
  ShieldCheck,
  BookOpen,
  X
} from "lucide-react";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} />;
  return <>{children}</>;
}

function Login() {
  const { signInWithGoogle, user } = useAuth();
  const location = useLocation();
  const [authError, setAuthError] = useState<"closed" | "blocked" | null>(null);
  const [activeModal, setActiveModal] = useState<'security' | 'science' | null>(null);
  
  // Interactive mini-simulator on landing page
  const [diet, setDiet] = useState<'meat' | 'balanced' | 'plant'>('balanced');
  const [driving, setDriving] = useState<number>(150); // miles per week
  const [householdSize, setHouseholdSize] = useState<number>(2);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      const isClosed = error?.message?.includes("popup-closed") || error?.code?.includes("popup-closed");
      if (isClosed) {
        console.warn("Google Authenticate cancelled by user:", error);
        setAuthError("closed");
      } else {
        console.error("Google Authenticate blocked or failed:", error);
        setAuthError("blocked");
      }
    }
  };

  const calculatedWeeklyEmissions = useMemo(() => {
    const transportVal = driving * 0.411; // 0.411 kg CO2 per mile driven
    const dietVal = diet === 'meat' ? 82.5 : diet === 'balanced' ? 47.2 : 18.9;
    const energyVal = (120 / householdSize) + 30; // base energy split + overhead
    return Math.round(transportVal + dietVal + energyVal);
  }, [diet, driving, householdSize]);

  const treeEquivalent = useMemo(() => {
    // 1 standard tree absorbs roughly 0.42 kg of CO2 per week (22kg/year)
    return Math.max(1, Math.round(calculatedWeeklyEmissions / 0.42));
  }, [calculatedWeeklyEmissions]);

  const from = location.state?.from?.pathname || "/";
  if (user) return <Navigate to={from} />;
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-x-hidden font-sans select-none">
      {/* Subtle organic background gradients */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[55%] h-[60%] rounded-full bg-green-100/40 blur-3xl"></div>
        <div className="absolute top-[20%] -left-[20%] w-[50%] h-[50%] rounded-full bg-[#E8F5E9]/50 blur-3xl"></div>
      </div>
      
      {/* Minimalistic Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-20 relative">
        <div className="font-logo font-extrabold text-2xl flex items-center gap-2 tracking-tight select-none cursor-default bg-gradient-to-r from-green-800 via-emerald-700 to-green-600 bg-clip-text text-transparent">
          Eco Assist AI
        </div>
        <button 
          onClick={handleLogin}
          className="text-sm font-bold text-green-800 hover:text-green-950 bg-green-50 hover:bg-green-100/80 px-5 py-2.5 rounded-full border border-green-200 transition-all active:scale-[0.98] cursor-pointer"
        >
          Enter Mission Control
        </button>
      </header>
      
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-20 z-10 relative flex flex-col items-center">
        {/* Main Title */}
        <h1 className="font-heading text-4xl sm:text-6xl font-black text-slate-900 tracking-tight text-center max-w-4xl leading-[1.1] mb-4">
          Understand Your Footprint. <br />
          <span className="bg-gradient-to-r from-green-800 via-emerald-700 to-green-600 bg-clip-text text-transparent">Reduce It Smarter.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-500 text-center max-w-2xl mb-12 text-sm sm:text-base font-medium leading-relaxed">
          The unified carbon ecosystem that calculates progress, mirrors choices via a smart digital twin, and tracks real emission offsets.
        </p>

        {/* Bento Grid: Core Features */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 mt-2">
          {/* Card 1: Baseline */}
          <div 
            onClick={handleLogin}
            className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-green-300 hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 group cursor-pointer active:scale-[0.99]"
          >
            <div className="space-y-4">
              <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110 duration-300">
                <Footprints className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-1.5">
                  Carbon Baseline
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Map your lifestyle with our precision 15-question diagnostic. Analyze travel mileage, nutrition weights, energy loads, and waste structures.
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogin();
              }}
              className="mt-8 pt-4 border-t border-slate-100 flex w-full items-center justify-between text-xs font-bold text-emerald-700 bg-transparent border-none p-0 cursor-pointer text-left"
            >
              <span>Precision Assessment</span>
              <span className="text-slate-300 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Card 2: Climate Twin */}
          <div 
            onClick={handleLogin}
            className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group cursor-pointer active:scale-[0.99]"
          >
            <div className="space-y-4">
              <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110 duration-300">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-1.5">
                  Climate Dev Twin
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Generate an AI-powered carbon reflection of your habits. Run simulations, test scenarios, and receive instant active coaching dialogue.
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogin();
              }}
              className="mt-8 pt-4 border-t border-slate-100 flex w-full items-center justify-between text-xs font-bold text-indigo-700 bg-transparent border-none p-0 cursor-pointer text-left"
            >
              <span>Interactive Simulator</span>
              <span className="text-slate-300 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Card 3: Weekly Eco-Missions */}
          <div 
            onClick={handleLogin}
            className="bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group cursor-pointer active:scale-[0.99]"
          >
            <div className="space-y-4">
              <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110 duration-300">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-800 mb-1.5">
                  Weekly Eco-Missions
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Pledge personalized, habit-forming actions targeting key offsets. Build streaks, track milestones, and grow virtual conservation projects.
                </p>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogin();
              }}
              className="mt-8 pt-4 border-t border-slate-100 flex w-full items-center justify-between text-xs font-bold text-amber-700 bg-transparent border-none p-0 cursor-pointer text-left"
            >
              <span>Gamified Progress</span>
              <span className="text-slate-300 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Live Simulator & CTA Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-4 max-w-5xl">
          {/* Left Panel: Call To Action and Sign-in */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/40 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 bg-green-50/50 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110 duration-500"></div>
            
            <div className="relative z-10 flex-1 flex flex-col justify-between">
              <div>
                <span className="bg-[#E8F5E9] text-[#1B5E20] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">100% Free Baseline Report</span>
                <h3 className="font-heading text-2xl font-black text-slate-800 leading-tight mb-3">Begin Your Impact Journey</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  Sign in securely with Google to run your first 15-question carbon assessment, unlock your personal weekly missions, and chat with your AI twin.
                </p>
              </div>
              
              {authError && (
                <div id="auth-error-panel" className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-2.5 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    {authError === "closed" ? "Authorization Closed" : "Auth Pop-up Blocked"}
                  </div>
                  <p className="leading-relaxed text-slate-600 font-medium">
                    Because this app is running in a secure, sandboxed preview iframe, your browser might block or restrict the Google Sign-In popup window.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <a 
                      href={window.location.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 bg-[#1B5E20] hover:bg-[#2E7D32] text-white px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer hover:shadow"
                    >
                      Open in New Tab
                    </a>
                    <button 
                      onClick={() => setAuthError(null)}
                      className="text-slate-600 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={handleLogin}
                className="w-full py-4 bg-[#1B5E20] text-white rounded-2xl text-base font-bold shadow-lg shadow-green-900/10 hover:bg-[#2E7D32] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group-hover:shadow-green-900/20"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Calculate My Footprint
                <ArrowRight className="w-4 h-4 text-white/80 transition-transform hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Panel: Pre-login Interactive Eco-Simulator */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/40 relative flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-heading text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-emerald-600" />
                  Eco-Impact Quick Simulator
                </h4>
                <span className="hidden sm:inline-block text-[10px] font-bold text-[#1B5E20] bg-green-50 px-2.5 py-1 rounded-full border border-green-100">PRE-LOGIN PLAYGROUND</span>
              </div>
              
              <div className="space-y-6">
                {/* Diet */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Diet Selection</span>
                    <span className="text-xs text-slate-400 font-medium">Diet is a major baseline factor</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['meat', 'balanced', 'plant'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDiet(type)}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${diet === type ? 'bg-[#1B5E20] text-white border-green-800 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {type === 'meat' ? '🥩 High Meat' : type === 'balanced' ? '⚖️ Balanced' : '🌱 Plant-Based'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Road Mileage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weekly Driving Mileage</span>
                    <span className="text-xs text-slate-800 font-extrabold">{driving} mi / week</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="400" 
                    value={driving} 
                    onChange={(e) => setDriving(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1B5E20] border border-slate-200/60"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                    <span>0 mi (Bike/Public)</span>
                    <span>200 mi</span>
                    <span>400 mi</span>
                  </div>
                </div>

                {/* Household Co-living */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Household Co-habitants</span>
                    <span className="text-xs text-slate-400 font-medium">Splits baseline thermal/waste load</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setHouseholdSize(num)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${householdSize === num ? 'bg-slate-900 text-white border-slate-950' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                      >
                        {num} {num === 1 ? 'Person' : 'People'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated output */}
            <div className="mt-8 bg-[#F0FDF4] border border-green-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-[10px] font-extrabold text-green-700 uppercase tracking-widest mb-1">Simulated Direct Feedback</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-800">{calculatedWeeklyEmissions}</span>
                  <span className="text-xs text-slate-500 font-bold">kg CO₂e per week</span>
                </div>
              </div>
              <div className="bg-white/80 border border-green-100/50 px-4 py-2.5 rounded-xl text-center sm:text-right w-full sm:w-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-1">Weekly Absorption Requirement</p>
                <p className="text-sm font-black text-slate-800">🌳 Requires {treeEquivalent} trees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <div className="w-full max-w-5xl mt-24">
          <div className="text-center mb-12">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Professional Climate Analysis Tools
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Carbon diagnostic dashboards modeled on global scientific calculation standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={handleLogin}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group cursor-pointer hover:border-green-400 hover:shadow-md active:scale-[0.99] transition-all"
            >
              <div className="bg-green-50 p-3 rounded-2xl w-fit mb-6 text-[#1B5E20] transition-transform group-hover:scale-110 duration-300">
                <Footprints className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-800 mb-2">Detailed Baseline Engine</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                Calculate scope-3 household, transit, aviation, diet, and municipal waste carbon output through a standardized audit.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin();
                }}
                className="text-[11px] font-bold text-[#1B5E20] inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
              >
                Comprehensive Audit <span className="text-slate-300 group-hover:translate-x-1 transition-transform ml-0.5">→</span>
              </button>
            </div>

            <div 
              onClick={handleLogin}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group cursor-pointer hover:border-blue-400 hover:shadow-md active:scale-[0.99] transition-all"
            >
              <div className="bg-blue-50 p-3 rounded-2xl w-fit mb-6 text-blue-600 transition-transform group-hover:scale-110 duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-800 mb-2">Digital Climate Twin</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                View projections to 2030 based on current trajectories. Visualize exactly where lifestyle variables have the highest leverage.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin();
                }}
                className="text-[11px] font-bold text-blue-600 inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
              >
                Predictive Analytics <span className="text-slate-300 group-hover:translate-x-1 transition-transform ml-0.5">→</span>
              </button>
            </div>

            <div 
              onClick={handleLogin}
              className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group cursor-pointer hover:border-amber-400 hover:shadow-md active:scale-[0.99] transition-all"
            >
              <div className="bg-amber-50 p-3 rounded-2xl w-fit mb-6 text-amber-600 transition-transform group-hover:scale-110 duration-300">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-800 mb-2">Weekly Climate Missions</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">
                Build progressive habits by taking on gamified weekly missions. Log savings, track achievements, and establish streaks.
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogin();
                }}
                className="text-[11px] font-bold text-amber-600 inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
              >
                Gamified Net Zero <span className="text-slate-300 group-hover:translate-x-1 transition-transform ml-0.5">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-5xl mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <p>© 2026 Eco Assist AI. Developed in accordance with global carbon diagnostic metrics.</p>
          <div className="flex gap-6 font-bold text-slate-500">
            <button 
              onClick={() => setActiveModal('security')}
              className="hover:text-slate-700 cursor-pointer text-xs font-bold transition-colors bg-transparent border-none p-0"
            >
              Security Protocol
            </button>
            <button 
              onClick={() => setActiveModal('science')}
              className="hover:text-slate-700 cursor-pointer text-xs font-bold transition-colors bg-transparent border-none p-0"
            >
              Science Methodology
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {activeModal === 'security' ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-[#1B5E20]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest block font-sans">Data & Privacy</span>
                    <h3 className="font-heading text-2xl font-black text-slate-900 leading-none">Security Protocol</h3>
                  </div>
                </div>

                <div className="space-y-4 text-slate-600 font-medium text-sm leading-relaxed">
                  <p>
                    Eco Assist AI operates on rigorous privacy benchmarks. We ensure your footprint data remains secure and controlled:
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Decentralized Auth:</strong> Authentication is powered by Google Firebase Auth. All logins occur directly with Google; passwords and sensitive keys never pass through Eco Assist servers.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Secure Database Storage:</strong> Personalized checklists, custom carbon factors, and mission logs are written to secured Firestore instances utilizing rules-based security layers.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Local Cache Resilience:</strong> Basic temporary input parameters are cached locally to provide reliable offline or non-blocking experience.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Zero Commercial Sharing:</strong> None of your behavioral analytics or transport choices are commoditized or transferred to third-party ad networks.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest block font-sans">Scientific Standard</span>
                    <h3 className="font-heading text-2xl font-black text-slate-900 leading-none">Science Methodology</h3>
                  </div>
                </div>

                <div className="space-y-4 text-slate-600 font-medium text-sm leading-relaxed">
                  <p>
                    Carbon estimates in our diagnostic dashboards are derived using world-standard baseline factors:
                  </p>
                  <ul className="space-y-3 list-none pl-0">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">EPA & DEFRA Conversion Factors:</strong> Quick simulator transport conversions average <code className="bg-slate-100 text-xs px-1 rounded font-mono text-emerald-800">0.411 kg CO₂e per driven mile</code>, mapped to average mid-sized passenger vehicles.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Dietary carbon footprint weights:</strong> Derived from global food systems reviews. Calculated weekly at 82.5 kg CO₂e (High Meat), 47.2 kg CO₂e (Balanced), or 18.9 kg CO₂e (strictly Plant-Based).
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Thermal/Waste sharing load:</strong> Based on a standard 120 kg CO₂e baseline distributed among household occupants, combined with a 30 kg CO₂e fixed baseline grid overhead.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">✓</span>
                      <div>
                        <strong className="text-slate-800">Tree Absorption Equivalents:</strong> Mapped assuming dry wood carbon storage metrics where an average mature tree sequesters ~22 kg CO₂ per year (~0.42 kg CO₂ per week).
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}

function Layout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="flex flex-col flex-1 max-w-7xl mx-auto h-screen">
        <header className="p-4 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4 w-full shadow-xs">
          <div className="font-logo font-extrabold text-2xl flex items-center gap-2 tracking-tight shrink-0 bg-gradient-to-r from-green-800 via-emerald-700 to-green-600 bg-clip-text text-transparent transition-transform hover:scale-[1.03] duration-200 select-none cursor-default py-1.5">
            Eco Assist AI
          </div>
          <nav className="flex flex-wrap justify-center overflow-x-auto gap-4 md:gap-6 items-center">
            <Link to="/" className={`text-sm font-semibold transition-colors px-2 ${path === '/' ? 'text-[#1B5E20] border-b-2 border-[#1B5E20]' : 'text-slate-500 hover:text-[#1B5E20]'}`}>Mission Control</Link>
            <Link to="/assessment" className={`text-sm font-semibold transition-colors px-2 ${path === '/assessment' ? 'text-[#1B5E20] border-b-2 border-[#1B5E20]' : 'text-slate-500 hover:text-[#1B5E20]'}`}>Impact Journey</Link>
            <Link to="/assistant" className={`text-sm font-semibold transition-colors px-2 ${path === '/assistant' ? 'text-[#1B5E20] border-b-2 border-[#1B5E20]' : 'text-slate-500 hover:text-[#1B5E20]'}`}>Climate Twin</Link>
            <Link to="/goals" className={`text-sm font-semibold transition-colors px-2 ${path === '/goals' ? 'text-[#1B5E20] border-b-2 border-[#1B5E20]' : 'text-slate-500 hover:text-[#1B5E20]'}`}>Weekly Missions</Link>
            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800 ml-2 cursor-pointer">Logout</button>
          </nav>
        </header>

        <main className="flex-1 p-8 overflow-y-auto w-full">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Layout />
      </DataProvider>
    </AuthProvider>
  );
}
