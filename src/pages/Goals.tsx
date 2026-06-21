// ... Keep imports ...
import { useState } from 'react';
import { useAuth } from '../components/auth-provider';
import { useData } from '../components/data-provider';
import { useApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Trash2, Edit2, X, Save, FileQuestion } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const { data, loading, refreshData, mutateData } = useData() as any; // Typecast or avoid typescript error
  const { fetchWithAuth } = useApi();
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const goals = data?.goals || [];

  // Edit State Modal
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth('/api/goals', token, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, targetReduction: Math.max(1, parseInt(newTarget) || 1) }),
      });
      if (res.ok) {
        await refreshData();
        setNewTitle('');
        setNewTarget('');
      }
    } catch(err) {
      console.error("Error creating goal", err);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!user) return;
    
    // Optimistic update
    mutateData((prev: any) => {
      if (!prev) return prev;
      return { ...prev, goals: prev.goals.filter((g: any) => g.id !== id) };
    });

    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth(`/api/goals/${id}`, token, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await refreshData(); // Revert
      }
    } catch(err) {
      console.error("Error deleting goal", err);
      await refreshData(); // Revert
    }
  };

  const handleStartEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.goalTitle || goal.title);
    setEditTarget(goal.targetReduction.toString());
  };

  const handleSaveEdit = async (id: number) => {
    if (!user) return;
    
    const targetRed = Math.max(1, parseInt(editTarget) || 1);
    
    // Optimistic
    mutateData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        goals: prev.goals.map((g: any) => g.id === id ? { ...g, goalTitle: editTitle, title: editTitle, targetReduction: targetRed } : g)
      };
    });
    setEditingGoalId(null);

    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth(`/api/goals/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, targetReduction: targetRed })
      });
      if (!res.ok) {
        await refreshData();
      }
    } catch(err) {
      console.error("Error updating goal", err);
      await refreshData();
    }
  };

  const handleUpdateProgress = async (id: number, currentProgress: number, addAmount: number) => {
    if (!user) return;
    
    // Optimistic update
    const newProgress = currentProgress + addAmount;
    mutateData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        goals: prev.goals.map((g: any) => g.id === id ? { ...g, progress: newProgress } : g)
      };
    });

    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth(`/api/goals/${id}/progress`, token, {
        method: 'PATCH',
        body: JSON.stringify({ progress: newProgress })
      });
      if (!res.ok) {
         await refreshData(); // Revert on fail
      }
    } catch(err) {
      console.error("Error updating progress", err);
      await refreshData();
    }
  };

  const SkeletonGoal = () => (
    <div className="bg-slate-100 h-full rounded-3xl p-6 border-none animate-pulse flex flex-col justify-between">
      <div>
         <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
         <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="mt-4">
         <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="space-y-8">
      <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonGoal />
        <SkeletonGoal />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
         <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900">Your Weekly Missions</h1>
         <p className="text-slate-500 mt-2">Achieve micro-goals to build better sustainable habits.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main active mission */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="bg-[#1B5E20] overflow-hidden rounded-3xl p-8 shadow-xl text-white relative h-full flex flex-col border-none min-h-[350px]">
             <div className="absolute top-0 right-0 p-24 bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
             
             <div className="relative z-10 flex-1">
                <div className="flex gap-2 items-center justify-between mb-4">
                   <div className="flex gap-2 items-center">
                     <Target className="h-5 w-5 text-green-300" />
                     <span className="text-xs font-bold text-green-300 uppercase tracking-widest">This Week's Mission</span>
                   </div>
                   {goals.length > 0 && (
                     <div className="flex gap-2">
                       <button onClick={() => handleStartEdit(goals[0])} className="text-white/60 hover:text-white transition-colors bg-black/20 p-2 rounded-full">
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <button onClick={() => handleDeleteGoal(goals[0].id)} className="text-white/60 hover:text-red-400 transition-colors bg-black/20 p-2 rounded-full">
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                   )}
                </div>
                {goals.length > 0 ? (
                  <>
                    <h2 className="text-3xl font-black leading-tight mb-2 truncate max-w-[200px] md:max-w-md lg:max-w-xl xl:max-w-2xl">{goals[0].goalTitle || goals[0].title}</h2>
                    <p className="text-white/80 font-medium mb-12">Focus on this single habit to make an outsized impact.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-black leading-tight mb-2">Kickstart your journey</h2>
                    <p className="text-white/80 font-medium mb-12">Commit to your very first weekly mission below.</p>
                  </>
                )}
             </div>

             {goals.length > 0 && (
               <div className="relative z-10 bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm mt-auto">
                  <div className="flex justify-between items-end mb-4">
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Estimated Impact</p>
                        <p className="text-4xl font-black text-green-400">{goals[0].targetReduction} <span className="text-lg text-white">kg CO₂ saved</span></p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-1">Progress</p>
                        <p className="text-xl font-bold">{Math.round((goals[0].progress / (goals[0].targetReduction || 1)) * 100) || 0}%</p>
                     </div>
                  </div>
                  
                  <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mb-4">
                     <motion.div 
                       className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(100, Math.round((goals[0].progress / (goals[0].targetReduction || 1)) * 100) || 0)}%` }}
                       transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                     ></motion.div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                     <button onClick={() => handleUpdateProgress(goals[0].id, goals[0].progress, 1)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20">
                        +1 kg
                     </button>
                     <button onClick={() => handleUpdateProgress(goals[0].id, goals[0].progress, 5)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20">
                        +5 kg
                     </button>
                     <button onClick={() => handleUpdateProgress(goals[0].id, goals[0].progress, 10)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20">
                        +10 kg
                     </button>
                  </div>
               </div>
             )}
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
            <Card className="bg-white border text-left border-slate-200 rounded-3xl p-6 shadow-sm flex-1">
               <CardHeader className="p-0 mb-4 flex flex-row items-center gap-2 space-y-0">
                 <CheckCircle2 className="h-5 w-5 text-blue-600" />
                 <CardTitle className="text-lg font-bold text-slate-800">Recommended Actions</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="space-y-3">
                   {[
                     { title: "Use public transport twice", target: "15" },
                     { title: "Combine errands into one trip", target: "8" },
                     { title: "Avoid one short regional flight", target: "52" }
                   ].map((rec) => {
                     const isSelected = newTitle === rec.title && newTarget === rec.target;
                     return (
                       <button 
                         key={rec.title}
                         type="button"
                         onClick={() => {
                           if (isSelected) {
                             setNewTitle('');
                             setNewTarget('');
                           } else {
                             setNewTitle(rec.title);
                             setNewTarget(rec.target);
                           }
                         }}
                         className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl transition-all border ${
                           isSelected 
                             ? 'bg-blue-50/50 border-blue-200 shadow-sm' 
                             : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                         } focus:outline-[#1B5E20]`}
                       >
                          <div className={`w-5 h-5 rounded border-2 mt-0.5 shrink-0 flex items-center justify-center text-xs transition-colors ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white font-bold' 
                              : 'border-slate-300'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <div>
                            <p className={`text-sm ${isSelected ? 'font-bold text-blue-900' : 'font-semibold text-slate-800'}`}>
                              {rec.title}
                            </p>
                            <p className={`text-xs mt-1 ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
                              - {rec.target} kg CO₂
                            </p>
                          </div>
                       </button>
                     );
                   })}
                 </div>
               </CardContent>
            </Card>

            <Card className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm flex-none">
               <CardHeader className="p-0 mb-4">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Commit to a New Habit</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <form onSubmit={handleCreateGoal} className="space-y-4">
                    <div className="space-y-2">
                       <Input 
                         required 
                         maxLength={80}
                         placeholder="e.g. Reduce flight frequency" 
                         value={newTitle}
                         onChange={e => setNewTitle(e.target.value)}
                         className="bg-white border-slate-200 rounded-xl py-5 px-4 text-sm focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
                       />
                    </div>
                    <div className="space-y-2 relative">
                       <Input 
                         required 
                         type="number"
                         min="1"
                         max="10000"
                         placeholder="Target reduction" 
                         value={newTarget}
                         onChange={e => setNewTarget(e.target.value)}
                         className="bg-white border-slate-200 rounded-xl py-5 px-4 text-sm focus-visible:ring-2 focus-visible:ring-[#1B5E20]"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">kg CO₂</span>
                    </div>
                    <Button type="submit" className="w-full py-5 bg-[#1B5E20] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2E7D32] active:scale-[0.98] transition-all">
                      Lock in Mission
                    </Button>
                 </form>
               </CardContent>
            </Card>
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Past & Other Active Missions</h3>
        {goals.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.slice(1).map((goal, i) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                layout
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm h-full flex flex-col justify-between group">
                     <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 leading-tight flex-1 mr-2 line-clamp-2" title={goal.goalTitle || goal.title}>{goal.goalTitle || goal.title}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleStartEdit(goal)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors">
                               <Edit2 className="h-3 w-3" />
                             </button>
                             <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-400 hover:text-red-500 bg-slate-100 p-1.5 rounded-full transition-colors">
                               <Trash2 className="h-3 w-3" />
                             </button>
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{goal.targetReduction} kg CO₂ target</p>
                     </div>
                   <div className="mt-6">
                      <div className="flex justify-between text-xs font-bold mb-2 text-slate-600">
                         <span>Progress</span>
                         <span>{Math.round((goal.progress / (goal.targetReduction || 1)) * 100) || 0}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-[#1B5E20] rounded-full" 
                           style={{ width: `${Math.min(100, Math.round((goal.progress / (goal.targetReduction || 1)) * 100) || 0)}%` }}
                         ></div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border text-center border-slate-200 border-dashed rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center min-h-[250px]">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <FileQuestion className="h-8 w-8 text-slate-300" />
             </div>
             <p className="text-lg font-bold text-slate-700 mb-1">No Past Missions</p>
             <p className="text-sm font-medium text-slate-500">Your mission history will appear here once you create more missions.</p>
          </div>
        )}
      </div>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {editingGoalId !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingGoalId(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Edit2 className="h-6 w-6 text-green-600" /> Edit Mission
              </h3>
              
              <div className="space-y-5">
                <div>
                  <Label className="text-slate-700 font-bold mb-2 block">Mission Title</Label>
                  <Input 
                    value={editTitle}
                    maxLength={80}
                    onChange={e => setEditTitle(e.target.value)}
                    className="bg-slate-50 border-slate-200 rounded-xl py-6 px-4"
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-bold mb-2 block">Target Reduction (kg CO₂)</Label>
                  <Input 
                    value={editTarget}
                    type="number"
                    min="1"
                    max="10000"
                    onChange={e => setEditTarget(e.target.value)}
                    className="bg-slate-50 border-slate-200 rounded-xl py-6 px-4"
                  />
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={() => handleSaveEdit(editingGoalId)} 
                    className="w-full py-6 bg-[#1B5E20] hover:bg-[#2E7D32] text-white rounded-xl font-bold text-lg"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
