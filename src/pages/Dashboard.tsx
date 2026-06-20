import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../components/auth-provider';
import { useApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footprints, Target, Activity, Lightbulb, TrendingDown } from 'lucide-react';
import { Link } from 'react-router';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, animate } from 'motion/react';
import { Leaf, Heart } from 'lucide-react';

function EcoFact() {
  const [liked, setLiked] = useState(false);
  
  return (
    <Card className="bg-gradient-to-br from-[#F0FDF4] to-white border border-green-100 rounded-3xl p-6 shadow-sm relative overflow-hidden mt-6">
       <div className="absolute top-0 right-0 p-12 bg-green-50 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
       <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-2xl shrink-0">
               <Leaf className="h-6 w-6 text-[#1B5E20]" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-1">Eco Fact of the Day</p>
               <p className="text-slate-800 font-medium leading-relaxed max-w-xl">
                 Switching just one 60-watt incandescent light bulb to an LED saves about 160 kg of CO₂ per year and reduces electricity costs significantly.
               </p>
            </div>
          </div>
          <button 
            onClick={() => setLiked(!liked)} 
            className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-full border transition-all ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
          >
             <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
             <span className="text-xs font-bold">{liked ? 'Liked' : 'Like'}</span>
          </button>
       </div>
    </Card>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Math.round(v).toString();
        }
      });
      return () => controls.stop();
    }
  }, [value]);
  
  return <span ref={nodeRef}>{value}</span>;
}

function AnimatedDecimal({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(prevValue.current, value, {
        duration: 0.4,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = Number(v).toFixed(2);
        }
      });
      prevValue.current = value;
      return () => controls.stop();
    }
  }, [value]);
  
  return <span ref={nodeRef}>{value.toFixed(2)}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { fetchWithAuth } = useApi();
  const [data, setData] = useState({ assessments: [], goals: [] } as any);
  const [loading, setLoading] = useState(true);

  // What-If Simulator state
  const [flightsPerYear, setFlightsPerYear] = useState(8);

  useEffect(() => {
    async function loadData() {
       if (!user) return;
       const token = await user.getIdToken();
       const res = await fetchWithAuth('/api/dashboard', token);
       if (res.ok) {
         setData(await res.json());
       }
       setLoading(false);
    }
    loadData();
  }, [user]);

  const SkeletonCard = ({ className }: { className?: string }) => (
    <div className={`bg-white border text-center text-slate-200 rounded-3xl p-6 shadow-sm animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-slate-200 rounded w-1/2 mb-4"></div>
      <div className="h-20 bg-slate-200 rounded w-full"></div>
    </div>
  );

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-[minmax(0,1fr)] lg:h-[600px]">
        <SkeletonCard className="lg:col-span-3 lg:row-span-3" />
        <SkeletonCard className="lg:col-span-6 lg:row-span-6" />
        <SkeletonCard className="lg:col-span-3 lg:row-span-3" />
        <SkeletonCard className="lg:col-span-3 lg:col-start-1 lg:row-start-4 lg:row-span-3" />
        <SkeletonCard className="lg:col-span-3 lg:col-start-10 lg:row-start-4 lg:row-span-3" />
      </div>
    </div>
  );

  const latestAssessment = data.assessments?.[0];

  const chartData = latestAssessment ? [
    { name: 'Transport', value: latestAssessment.transportScore },
    { name: 'Energy', value: latestAssessment.energyScore },
    { name: 'Food', value: latestAssessment.foodScore },
    { name: 'Waste', value: latestAssessment.wasteScore },
  ] : [];

  const COLORS = ['#1B5E20', '#0288D1', '#F59E0B', '#DC2626'];

  // AI Recommendation logic mock based on top category
  let highlightReco = "Reduce overall consumption.";
  let impactVal = "0.5 tons CO₂";
  if (latestAssessment) {
    const max = Math.max(latestAssessment.transportScore, latestAssessment.energyScore, latestAssessment.foodScore, latestAssessment.wasteScore);
    if (max === latestAssessment.transportScore) { highlightReco = "Reduce flights by 2 trips/year."; impactVal = "1.8 tons CO₂"; }
    else if (max === latestAssessment.energyScore) { highlightReco = "Install a smart thermostat."; impactVal = "0.8 tons CO₂"; }
    else if (max === latestAssessment.foodScore) { highlightReco = "Switch to a planetary health diet 3 days/week."; impactVal = "1.2 tons CO₂"; }
    else { highlightReco = "Improve recycling and composting habits."; impactVal = "0.3 tons CO₂"; }
  }

  // Calculate score logic (0-100 where higher is better, lower footprint is better)
  let sustainabilityScore = 0;
  let statusColor = "text-[#1B5E20]";
  let statusText = "GOOD";
  
  if (latestAssessment) {
     const ratio = latestAssessment.totalScore / 1000;
     sustainabilityScore = Math.max(0, Math.min(100, Math.round(100 - (ratio * 50))));
     
     if (sustainabilityScore < 40) {
        statusColor = "text-[#DC2626]";
        statusText = "HIGH IMPACT";
     } else if (sustainabilityScore < 70) {
        statusColor = "text-[#F59E0B]";
        statusText = "AVERAGE";
     }
  }

  const currentAnnualFootprint = latestAssessment ? ((latestAssessment.totalScore / 1000) * 12) : 0;
  const simulatedScore = Math.min(100, sustainabilityScore + ((8 - flightsPerYear) * 3));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">🌍 Climate Twin Report</h1>
          <p className="text-slate-500 mt-1">An evolving digital representation of your environmental impact.</p>
        </div>
      </div>
      
      {latestAssessment ? (
        <>
            {/* Wow Factor: 2030 Projection Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="bg-[#1B5E20] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-center">
                 <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3"></div>
                 <h3 className="text-white/80 font-bold text-sm tracking-widest uppercase mb-1">If You Continue Habits</h3>
                 <p className="text-white/90 text-[10px] uppercase font-bold mb-4">2030 Annual Footprint</p>
                 <div className="flex items-end gap-2">
                   <p className="text-5xl font-black">{currentAnnualFootprint.toFixed(1)}</p>
                   <p className="text-xl text-white/70 font-medium mb-1">tons CO₂</p>
                 </div>
              </div>
              
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center justify-center text-center relative z-10">
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Potential Reduction</p>
                 <div className="flex items-center gap-2 text-[#16A34A]">
                   <TrendingDown className="h-8 w-8" />
                   <p className="text-4xl font-black">{(currentAnnualFootprint * 0.25).toFixed(1)}</p>
                 </div>
                 <p className="text-sm text-slate-500 font-medium mt-1">tons CO₂ saved (-25%)</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
                 <h3 className="text-emerald-800 font-bold text-sm tracking-widest uppercase mb-1">If You Complete Goals</h3>
                 <p className="text-emerald-600/80 text-[10px] uppercase font-bold mb-4">2030 Annual Footprint</p>
                 <div className="flex items-end gap-2">
                   <p className="text-5xl font-black text-emerald-900">{(currentAnnualFootprint * 0.75).toFixed(1)}</p>
                   <p className="text-xl text-emerald-700 font-medium mb-1">tons CO₂</p>
                 </div>
              </div>
            </div>

            {/* AI Prediction Alert */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="relative flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                   </span>
                   <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">AI Prediction</h3>
                 </div>
                 <p className="text-indigo-800 font-medium text-lg">
                   Based on your behavior patterns, <span className="font-bold">transport emissions will increase 12%</span> over the next year.
                 </p>
               </div>
               <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-indigo-50/50 shrink-0">
                 <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Suggested Intervention</p>
                 <p className="font-bold text-slate-800">Reduce flights by 2 trips/year.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-[minmax(0,1fr)] lg:h-[600px]">
              
              {/* Score Card */}
              <Card className="lg:col-span-3 lg:row-span-3 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
                 <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sustainability Score</span>
                    <span className="px-2 py-1 bg-green-50 text-[#16A34A] text-xs font-bold rounded-full">+12% vs LY</span>
                 </div>
                 <div className="mt-4 flex flex-col items-center flex-1 justify-center">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                        <motion.circle 
                          cx="64" cy="64" r="56" 
                          stroke={sustainabilityScore > 70 ? "#1B5E20" : sustainabilityScore > 40 ? "#F59E0B" : "#DC2626"} 
                          strokeWidth="12" 
                          strokeLinecap="round" 
                          fill="transparent"
                          initial={{ strokeDasharray: "0 400" }}
                          animate={{ strokeDasharray: `${Math.round(2 * Math.PI * 56 * (sustainabilityScore / 100))} 400` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="absolute text-4xl font-bold text-slate-800">
                         <AnimatedNumber value={sustainabilityScore} />
                      </span>
                    </div>
                    <motion.p 
                      className="mt-4 text-sm font-medium text-slate-600"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      Status: <span className={`${statusColor} font-bold tracking-wider`}>{statusText}</span>
                    </motion.p>
                 </div>
              </Card>

              {/* Chart Card */}
              <Card className="lg:col-span-6 lg:row-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col relative">
                 <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Emission Breakdown</h2>
                      <p className="text-xs text-slate-400">Carbon emissions by category</p>
                    </div>
                 </div>
                 <div className="flex-1 relative w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} kg CO₂`} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3 items-start">
                    <span className="relative flex h-2 w-2 mt-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-1">AI Insight</p>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">
                        Transportation accounts for a significant portion of emissions. Your footprint pattern is similar to frequent domestic travelers.
                      </p>
                    </div>
                 </div>
              </Card>

              {/* Recommendation Content */}
              <Card className="lg:col-span-3 lg:row-span-3 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col shadow-sm max-h-[350px] overflow-y-auto hidden-scrollbar relative">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highest-Leverage Action</span>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200">#1 RANKED</span>
                 </div>
                 <div className="flex-1 flex flex-col relative">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">{highlightReco}</h3>
                    
                    <div className="flex gap-2 mb-4">
                       <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Score: 92/100</span>
                       <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Confidence: High</span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Why this ranks #1</p>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        This category contributes to &gt;50% of your footprint. This single action saves 3.2x more carbon than completely eliminating your household waste.
                      </p>
                    </div>

                    <div className="mt-auto">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Impact Setup:</p>
                       <p className="text-xl font-black text-[#1B5E20]">{impactVal} / year</p>
                    </div>
                 </div>
              </Card>

              {/* What-If Simulator Card */}
              <Card className="lg:col-span-3 lg:col-start-1 lg:row-start-4 lg:row-span-3 bg-slate-900 border-none rounded-3xl flex flex-col shadow-sm p-6 justify-between text-white">
                 <div>
                    <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
                       Future Projection
                    </h2>
                    <p className="text-xs text-white/50">Simulate: Flights per year</p>
                 </div>
                 <div className="py-4">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-2xl font-black">{flightsPerYear}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="12" 
                      value={flightsPerYear} 
                      onChange={(e) => setFlightsPerYear(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
                 <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-1">
                       <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Projected Score</p>
                       <span className="text-xs text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">LIVE</span>
                    </div>
                    <p className="text-3xl font-black text-white">
                      <AnimatedNumber value={simulatedScore} />
                    </p>
                    <p className="text-xs text-white/60 mt-1">If reduced from origin</p>
                 </div>
              </Card>
              
              {/* Goals Card */}
              <Card className="lg:col-span-3 lg:col-start-10 lg:row-start-4 lg:row-span-3 bg-[#1B5E20] rounded-3xl p-6 shadow-md text-white flex flex-col justify-between overflow-hidden relative">
                 <div className="absolute -right-4 -top-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
                 <div className="relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-4">
                       <h2 className="text-[10px] font-bold text-green-300 uppercase tracking-widest mb-1">Weekly Mission</h2>
                       <Target className="h-4 w-4 text-green-300" />
                    </div>
                    <p className="text-xl font-bold leading-tight mb-4">Reduce transport emissions by 5%</p>
                 </div>
                 <div className="mt-auto relative z-10">
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-white/80">Mission Progress</span>
                       <span>32%</span>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full bg-green-400 rounded-full" 
                         initial={{ width: 0 }}
                         animate={{ width: '32%' }}
                         transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                       ></motion.div>
                    </div>
                    <p className="text-[10px] text-white/60 font-medium mt-3 text-center">Complete by Sunday • 75kg CO₂ saved</p>
                 </div>
              </Card>
            </div>
            
            {/* Eco Fact of the Day */}
            <EcoFact />
        </>
      ) : (
        <Card className="bg-white border text-center text-slate-600 rounded-3xl p-12 shadow-sm max-w-2xl mx-auto flex flex-col items-center">
           <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Footprints className="h-10 w-10 text-[#1B5E20]" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800 mb-3">Begin Your Sustainability Journey</h2>
           <p className="mb-8 text-slate-500 max-w-md">Your dashboard is empty. Take the initial carbon footprint assessment to establish your baseline and get personalized AI coaching.</p>
           <Link to="/assessment" className="px-8 py-4 bg-[#1B5E20] text-white rounded-2xl text-base font-bold shadow-lg shadow-green-900/10 hover:bg-[#2E7D32] active:scale-[0.98] transition-all">
             Start Assessment Now
           </Link>
        </Card>
      )}
    </div>
  );
}
