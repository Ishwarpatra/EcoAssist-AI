import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/auth-provider';
import { useData } from '../components/data-provider';
import { useApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';

function ThinkingDots() {
  return (
    <div className="flex justify-start mb-4">
       <motion.div 
         initial={{ opacity: 0, y: 10 }} 
         animate={{ opacity: 1, y: 0 }} 
         className="bg-slate-50 p-4 rounded-2xl rounded-bl-none text-slate-500 text-sm flex items-center gap-2"
       >
         <span className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B5E20] opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B5E20]"></span>
         </span>
         <span>Analyzing dataset...</span>
       </motion.div>
    </div>
  );
}

export default function Assistant() {
  const { user } = useAuth();
  const { data: snapshot } = useData();
  const { fetchWithAuth } = useApi();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || loading) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const token = await user.getIdToken();
      const res = await fetchWithAuth('/api/ai/chat', token, {
        method: 'POST',
        body: JSON.stringify({ message: userMessage }),
        signal: controller.signal,
      });
      
      if (res.ok) {
         const data = await res.json();
         setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
         const errorData = await res.json();
         setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** ${errorData.error || 'Failed to get response'}` }]);
      }
    } catch(err: any) {
      if (err.name === 'AbortError') {
         console.log('Generation aborted by user');
      } else {
         console.error(err);
         setMessages(prev => [...prev, { role: 'assistant', content: `**Error:** An unexpected error occurred.` }]);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  return (
    <Card className="flex flex-col h-full max-h-[85vh] bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden mx-auto max-w-4xl">
      <CardHeader className="p-6 border-b border-slate-100 bg-white">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
           <span className="relative flex h-3 w-3">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
           </span>
           AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white">
        
        {snapshot && messages.length === 0 && (
          <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-6 p-4 rounded-2xl bg-[#F0FDF4] border border-green-100/50 shadow-sm"
          >
             <h4 className="font-heading text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-3">Your Climate Snapshot</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white px-3 py-3 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Monthly Impact</p>
                   {snapshot.assessments?.[0] ? (
                     <p className="text-sm font-black text-slate-800">
                        {Math.round(
                          snapshot.assessments[0].transportScore + 
                          snapshot.assessments[0].energyScore + 
                          snapshot.assessments[0].foodScore + 
                          snapshot.assessments[0].wasteScore
                        )} kg CO₂
                     </p>
                   ) : (
                     <p className="text-sm font-semibold text-slate-400">No data</p>
                   )}
                </div>
                <div className="bg-white px-3 py-3 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Biggest Source</p>
                   <p className="text-sm font-black text-slate-800">Transportation</p>
                </div>
                <div className="bg-white px-3 py-3 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Highest-Leverage</p>
                   <p className="text-sm font-black text-slate-800">Reduce Flights</p>
                </div>
                <div className="bg-white px-3 py-3 rounded-xl shadow-sm border border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">2030 Projection</p>
                   <p className="text-sm font-black text-[#1B5E20]">{snapshot.assessments?.[0] ? ((snapshot.assessments[0].transportScore + snapshot.assessments[0].energyScore + snapshot.assessments[0].foodScore + snapshot.assessments[0].wasteScore) / 1000 * 12).toFixed(1) : '--'} tons</p>
                </div>
             </div>
          </motion.div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-10 px-4 text-slate-500">
            <h3 className="font-heading text-lg font-bold mb-3 text-slate-800">Hi {user?.displayName ? user.displayName.split(' ')[0] : 'there'}, your climate twin is ready.</h3>
            <p className="text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              I can analyze your footprint, simulate future scenarios, or help you understand which lifestyle changes have the highest leverage.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
               <button onClick={() => setInput("What is my highest source of emissions?")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full font-medium transition-colors">
                  Highest source of emissions?
               </button>
               <button onClick={() => setInput("What matters most: diet or flights?")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full font-medium transition-colors">
                  Diet vs Flights?
               </button>
               <button onClick={() => setInput("Simulate what happens if I reduce driving.")} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-full font-medium transition-colors">
                  Simulate reduction
               </button>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-50 text-[#0288D1] font-medium rounded-br-none text-right' : 'bg-slate-50 text-slate-700 rounded-bl-none'}`}>
               {msg.role === 'user' ? (
                 msg.content
               ) : (
                 <div className="markdown-body">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                 </div>
               )}
            </div>
          </motion.div>
        ))}
        {loading && <ThinkingDots />}
        <div ref={bottomRef} />
      </CardContent>
      <CardFooter className="p-4 md:p-6 bg-white shrink-0">
        <form onSubmit={sendMessage} className="w-full relative">
          <textarea 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your footprint... (Shift+Enter for new line)"
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pr-16 pl-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20] shadow-none resize-none overflow-hidden min-h-[60px]"
            rows={2}
          />
          {loading ? (
             <Button type="button" onClick={handleStop} className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-200">
               <Square className="w-4 h-4 fill-current" />
             </Button>
          ) : (
             <Button type="submit" disabled={!input.trim()} className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-[#1B5E20] text-white rounded-xl flex items-center justify-center hover:bg-[#2E7D32]">
               <SendHorizontal className="w-4 h-4" />
             </Button>
          )}
        </form>
      </CardFooter>
    </Card>
  );
}
