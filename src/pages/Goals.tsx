import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth-provider';
import { useApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Target, CheckCircle2, Trash2, Edit2, X, Save } from 'lucide-react';

export default function Goals() {
  const { user } = useAuth();
  const { fetchWithAuth } = useApi();
  const [goals, setGoals] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTarget, setEditTarget] = useState('');

  useEffect(() => {
    async function fetchGoals() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetchWithAuth('/api/dashboard', token);
        if (res.ok) {
           const data = await res.json();
           setGoals(data.goals || []);
        }
      } catch (err) {
        console.error("Error fetching goals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, [user]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth('/api/goals', token, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle, targetReduction: parseInt(newTarget) }),
      });
      if (res.ok) {
        const goal = await res.json();
        setGoals([goal, ...goals]);
        setNewTitle('');
        setNewTarget('');
      }
    } catch(err) {
      console.error("Error creating goal", err);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth(`/api/goals/${id}`, token, {
        method: 'DELETE'
      });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch(err) {
      console.error("Error deleting goal", err);
    }
  };

  const handeStartEdit = (goal: any) => {
    setEditingGoalId(goal.id);
    setEditTitle(goal.goalTitle || goal.title);
    setEditTarget(goal.targetReduction.toString());
  };

  const handleSaveEdit = async (id: number) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth(`/api/goals/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, targetReduction: parseInt(editTarget) })
      });
      if (res.ok) {
        const updatedGoal = await res.json();
        setGoals(goals.map(g => g.id === id ? { ...g, goalTitle: updatedGoal.goalTitle, title: updatedGoal.goalTitle, targetReduction: updatedGoal.targetReduction } : g));
        setEditingGoalId(null);
      }
    } catch(err) {
      console.error("Error updating goal", err);
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
         <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Weekly Missions</h1>
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
                   {goals.length > 0 && editingGoalId !== goals[0].id && (
                     <div className="flex gap-2">
                       <button onClick={() => handeStartEdit(goals[0])} className="text-white/60 hover:text-white transition-colors bg-black/20 p-2 rounded-full">
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <button onClick={() => handleDeleteGoal(goals[0].id)} className="text-white/60 hover:text-red-400 transition-colors bg-black/20 p-2 rounded-full">
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                   )}
                </div>
                {goals.length > 0 ? (
                  editingGoalId === goals[0].id ? (
                    <div className="space-y-4 mb-12">
                       <div>
                         <Label className="text-white/90 font-bold mb-1 block">Mission Title</Label>
                         <Input 
                           value={editTitle}
                           onChange={e => setEditTitle(e.target.value)}
                           className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                         />
                       </div>
                       <div>
                         <Label className="text-white/90 font-bold mb-1 block">Target Reduction (kg CO₂)</Label>
                         <Input 
                           value={editTarget}
                           type="number"
                           onChange={e => setEditTarget(e.target.value)}
                           className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                         />
                       </div>
                       <div className="flex gap-3">
                         <Button onClick={() => setEditingGoalId(null)} variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                           Cancel
                         </Button>
                         <Button onClick={() => handleSaveEdit(goals[0].id)} className="bg-green-500 hover:bg-green-400 text-green-950 font-bold">
                           <Save className="h-4 w-4 mr-2" /> Save Changes
                         </Button>
                       </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-black leading-tight mb-2">{goals[0].goalTitle || goals[0].title}</h2>
                      <p className="text-white/80 font-medium mb-12">Focus on this single habit to make an outsized impact.</p>
                    </>
                  )
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
                        <p className="text-xl font-bold">{Math.round((goals[0].progress / goals[0].targetReduction) * 100)}%</p>
                     </div>
                  </div>
                  
                  <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-gradient-to-r from-green-400 to-emerald-300 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min(100, Math.round((goals[0].progress / goals[0].targetReduction) * 100))}%` }}
                       transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                     ></motion.div>
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
                   <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                      <div className="w-5 h-5 rounded border-2 border-slate-300 mt-0.5 shrink-0 flex items-center justify-center bg-blue-600 border-blue-600 text-white">✓</div>
                      <div>
                        <p className="font-bold text-blue-900 text-sm">Use public transport twice</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">- 15 kg CO₂</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                      <div className="w-5 h-5 rounded border-2 border-slate-300 mt-0.5 shrink-0"></div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Combine errands into one trip</p>
                        <p className="text-xs text-slate-500 mt-1">- 8 kg CO₂</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                      <div className="w-5 h-5 rounded border-2 border-slate-300 mt-0.5 shrink-0"></div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Avoid one short regional flight</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">- 52 kg CO₂</p>
                      </div>
                   </div>
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
      
      {goals.length > 1 && (
        <div className="mt-12">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Past & Other Active Missions</h3>
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
                   {editingGoalId === goal.id ? (
                     <div className="space-y-4 mb-4">
                        <div>
                          <Label className="text-slate-700 font-bold mb-1 block">Mission Title</Label>
                          <Input 
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="bg-slate-50 border-slate-200 rounded-xl w-full"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-700 font-bold mb-1 block">Target Reduction (kg CO₂)</Label>
                          <Input 
                            value={editTarget}
                            type="number"
                            onChange={e => setEditTarget(e.target.value)}
                            className="bg-slate-50 border-slate-200 rounded-xl w-full"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button onClick={() => setEditingGoalId(null)} variant="outline" size="sm" className="w-full">
                            Cancel
                          </Button>
                          <Button onClick={() => handleSaveEdit(goal.id)} size="sm" className="w-full bg-[#1B5E20] hover:bg-[#2E7D32]">
                            Save
                          </Button>
                        </div>
                     </div>
                   ) : (
                     <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 leading-tight flex-1 mr-2">{goal.goalTitle || goal.title}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handeStartEdit(goal)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors">
                               <Edit2 className="h-3 w-3" />
                             </button>
                             <button onClick={() => handleDeleteGoal(goal.id)} className="text-slate-400 hover:text-red-500 bg-slate-100 p-1.5 rounded-full transition-colors">
                               <Trash2 className="h-3 w-3" />
                             </button>
                          </div>
                        </div>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{goal.targetReduction} kg CO₂ target</p>
                     </div>
                   )}
                   <div className="mt-6">
                      <div className="flex justify-between text-xs font-bold mb-2 text-slate-600">
                         <span>Progress</span>
                         <span>{Math.round((goal.progress / goal.targetReduction) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-[#1B5E20] rounded-full" 
                           style={{ width: `${Math.min(100, Math.round((goal.progress / goal.targetReduction) * 100))}%` }}
                         ></div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
