import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/auth-provider';
import { useData } from '../components/data-provider';
import { useApi } from '../lib/api';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Assessment() {
  const { user } = useAuth();
  const { data, loading, refreshData } = useData();
  const { fetchWithAuth } = useApi();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && data) {
      if (data.assessments && data.assessments.length > 0) {
        setShowForm(false);
      } else {
        setShowForm(true);
      }
    }
  }, [loading, data]);

  const [inputs, setInputs] = useState({
    flightsBase: '',
    kmBase: '',
    energyBase: '',
    foodBase: '',
    wasteBase: ''
  });

  const [scores, setScores] = useState({
    transportScore: 0,
    energyScore: 0,
    foodScore: 0,
    wasteScore: 0,
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (inputs.flightsBase === '' || inputs.kmBase === '')) return;
    if (step === 2 && inputs.energyBase === '') return;
    if (step === 3 && inputs.foodBase === '') return;
    if (step === 4 && inputs.wasteBase === '') return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Send raw inputs, backend calculates score
      handleSubmit(inputs);
    }
  };

  const handleSubmit = async (rawInputs: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
        const token = await user.getIdToken();
        const res = await fetchWithAuth('/api/assessments', token, {
          method: 'POST',
          body: JSON.stringify(rawInputs),
        });
        
        if (res.ok) {
           await refreshData();
           navigate('/');
        }
    } catch (error) {
        console.error("Submission error", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const chartData = [
    { month: 'Jan', emissions: 2.1 },
    { month: 'Feb', emissions: 2.4 },
    { month: 'Mar', emissions: 1.9 },
    { month: 'Apr', emissions: 1.8 },
  ];

  if (loading) return <div></div>;

  if (!showForm) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-end">
           <div>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">Impact Journey</h1>
              <p className="text-slate-500 mt-2">The narrative of your environmental footprint over time.</p>
           </div>
           <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-xl border-slate-300 font-bold">
              Update Twin
           </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Emissions Trend (tons CO₂)</h2>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B5E20" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1B5E20" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1B5E20', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="emissions" stroke="#1B5E20" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-6">
              <Card className="bg-[#1B5E20] text-white rounded-3xl p-6 shadow-lg border-none flex-1 flex flex-col justify-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-16 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                 <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="relative flex h-2 w-2">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                     </span>
                     <span className="text-xs font-bold text-green-300 uppercase tracking-widest">Narrative AI</span>
                   </div>
                   <p className="text-2xl font-bold leading-tight mb-4">Emissions dropped <br/>21% in March</p>
                   <p className="text-white/80 text-sm leading-relaxed font-medium">Because your transportation footprint decreased after limiting flights. This one behavior caused more impact than all of your household energy savings combined.</p>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    );
  }

  // Define steps for card stack
  const stepsData = useMemo(() => [
    {
      id: 1,
      title: "Transportation",
      icon: "🚗 🚌 🚲 ✈️",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
             <Label className="text-slate-700 font-semibold mb-2 block">How many flights do you take per year?</Label>
             <select 
               value={inputs.flightsBase}
               onChange={e => setInputs({ ...inputs, flightsBase: e.target.value })}
               className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
             >
               <option value="" disabled>Please select...</option>
               <option value="0">0 (I don't fly)</option>
               <option value="2">1-2 flights</option>
               <option value="5">3-5 flights</option>
               <option value="10">6-10 flights</option>
               <option value="20">More than 10 flights</option>
             </select>
          </div>
          <div className="space-y-2 mt-6">
             <Label className="text-slate-700 font-semibold mb-2 block">How many km do you drive weekly?</Label>
             <Input 
               type="number" 
               required
               value={inputs.kmBase}
               onChange={e => setInputs({ ...inputs, kmBase: e.target.value })}
               placeholder="e.g. 150"
               className="bg-slate-50 border-slate-200 rounded-2xl py-6 px-4 text-sm focus-visible:ring-[#1B5E20]"
             />
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Energy & Home",
      icon: "⚡ 🔥 🌞",
      content: (
        <div className="space-y-2 mt-4">
          <Label className="text-slate-700 font-semibold mb-2 block">Describe your home's energy usage</Label>
          <select 
            value={inputs.energyBase}
            onChange={e => setInputs({ ...inputs, energyBase: e.target.value })}
            className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
          >
            <option value="" disabled>Please select...</option>
            <option value="low">Low (Small apartment, no AC, energy efficient)</option>
            <option value="moderate">Moderate (Average house, standard usage)</option>
            <option value="high">High (Large house, frequent heating/cooling)</option>
          </select>
        </div>
      )
    },
    {
      id: 3,
      title: "Diet & Food",
      icon: "🥩 🍗 🥗 🌱",
      content: (
        <div className="space-y-2 mt-4">
          <Label className="text-slate-700 font-semibold mb-2 block">What best describes your diet?</Label>
          <select 
            value={inputs.foodBase}
            onChange={e => setInputs({ ...inputs, foodBase: e.target.value })}
            className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
          >
            <option value="" disabled>Please select...</option>
            <option value="heavy_meat">Heavy Meat (Beef/lamb most days)</option>
            <option value="moderate">Moderate (Mixed diet, some meat)</option>
            <option value="vegetarian">Vegetarian (No meat, but dairy/eggs)</option>
            <option value="vegan">Vegan (Plant-based only)</option>
          </select>
        </div>
      )
    },
    {
      id: 4,
      title: "Lifestyle & Waste",
      icon: "🛍️ ♻️ 🗑️",
      content: (
        <div className="space-y-2 mt-4">
          <Label className="text-slate-700 font-semibold mb-2 block">How do you describe your recycling and waste habits?</Label>
          <select 
            value={inputs.wasteBase}
            onChange={e => setInputs({ ...inputs, wasteBase: e.target.value })}
            className="flex h-14 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
          >
            <option value="" disabled>Please select...</option>
            <option value="great">Excellent (Compost, strict recycling, low packaging)</option>
            <option value="moderate">Average (Standard recycling, some plastic waste)</option>
            <option value="bad">Poor (Rarely recycle, high plastic usage)</option>
          </select>
        </div>
      )
    }
  ], [inputs]);

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-16">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Build Your Climate Twin</h1>
        <p className="text-slate-500">Provide a few daily habits to compute your digital footprint.</p>
        <div className="mt-8 flex justify-center gap-2">
           {stepsData.map((s) => (
             <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${s.id === step ? 'w-8 bg-[#1B5E20]' : 'w-2 bg-slate-200'}`}></div>
           ))}
        </div>
      </div>

      <div className="relative h-[480px] w-full flex justify-center perspective-[1200px]">
        <AnimatePresence mode="popLayout">
          {stepsData.map((stepData, index) => {
            const isActive = stepData.id === step;
            const isPast = stepData.id < step;
            const isUpcoming = stepData.id > step;
            
            // Only render current and next couple of cards for performance and visual stack
            if (stepData.id < step - 1 || stepData.id > step + 2) return null;

            let zIndex = 10 - index;
            let scale = isActive ? 1 : isPast ? 1.05 : 1 - (stepData.id - step) * 0.05;
            let y = isActive ? 0 : isPast ? -50 : (stepData.id - step) * 20;
            let opacity = isActive ? 1 : isPast ? 0 : 1;

            return (
              <motion.div
                key={stepData.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity, y, scale, zIndex }}
                exit={{ opacity: 0, scale: 1.05, y: -50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-full px-4"
                style={{ originY: 0 }}
              >
                <Card className={`w-full bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden ${!isActive ? 'pointer-events-none opacity-50' : ''}`} aria-hidden={!isActive}>
                  <form onSubmit={handleNext} className="p-8 pb-10">
                    <fieldset disabled={!isActive} className="contents">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4 text-3xl">{stepData.icon}</div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{step} of {totalSteps}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-slate-800 mb-6">{stepData.title}</h2>
                      {stepData.content}
                      
                      {isActive && (
                        <div className="mt-10 flex gap-4">
                          {step > 1 && (
                            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="w-1/3 py-6 bg-white border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50">
                              Back
                            </Button>
                          )}
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 py-6 bg-[#1B5E20] text-white rounded-2xl text-lg font-bold shadow-lg shadow-green-900/10 hover:bg-[#2E7D32] active:scale-[0.98] transition-all"
                          >
                            {isSubmitting ? 'Submitting...' : step === totalSteps ? 'Generate Twin' : 'Continue'}
                          </Button>
                        </div>
                      )}
                    </fieldset>
                  </form>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
