import { Routes, Route, Link, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { DataProvider } from "./components/data-provider";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Assistant from "./pages/Assistant";
import Goals from "./pages/Goals";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

function Login() {
  const { signInWithGoogle, user } = useAuth();
  if (user) return <Navigate to="/" />;
  
  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-green-100/50 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/50 blur-3xl"></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 z-10 relative">
        <div className="w-16 h-16 bg-[#1B5E20] rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20 mb-8 mt-12">
           <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"></path>
           </svg>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight text-center max-w-4xl leading-tight mb-6">
          Understand Your Carbon Footprint. <br className="hidden sm:block" />
          <span className="text-[#1B5E20]">Reduce It Smarter.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-600 text-center max-w-2xl mb-12">
          AI-powered sustainability coaching. Calculate your footprint, get personalized recommendations, and track your progress to a greener lifestyle.
        </p>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 max-w-sm w-full text-center flex flex-col items-center gap-6">
          <p className="font-semibold text-slate-800">Start Your Journey</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full py-4 bg-[#1B5E20] text-white rounded-2xl text-base font-bold shadow-lg shadow-green-900/10 hover:bg-[#2E7D32] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Calculate My Footprint
          </button>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="flex flex-col flex-1 max-w-7xl mx-auto h-screen">
        <header className="p-4 border-b flex flex-col md:flex-row justify-between items-center bg-white gap-4">
          <div className="font-bold text-[#1B5E20] text-xl flex items-center gap-2 tracking-tight">
            EcoAssist AI
          </div>
          <nav className="flex flex-wrap justify-center gap-6 items-center">
            {user && (
               <>
                 <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-[#1B5E20] transition-colors">Mission Control</Link>
                 <Link to="/assessment" className="text-sm font-semibold text-slate-700 hover:text-[#1B5E20] transition-colors">Impact Journey</Link>
                 <Link to="/assistant" className="text-sm font-semibold text-slate-700 hover:text-[#1B5E20] transition-colors">Climate Twin</Link>
                 <Link to="/goals" className="text-sm font-semibold text-slate-700 hover:text-[#1B5E20] transition-colors">Weekly Missions</Link>
                 <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-800 ml-2 md:ml-4">Logout</button>
               </>
            )}
          </nav>
        </header>

        <main className="flex-1 p-8 overflow-y-auto w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
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
