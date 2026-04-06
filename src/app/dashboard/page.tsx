"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, IndianRupee, Bell } from 'lucide-react';
import factories from '@/data/factories.json';
import { motion } from 'framer-motion';
import CircularityScoreWidget from '@/components/CircularityScoreWidget';

const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface animate-pulse rounded-xl border border-teal-accent/20 flex items-center justify-center">Loading Map...</div>
});

const sourceLat = 21.1702; // Surat
const sourceLon = 72.8311;

export default function Dashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [co2Saved, setCo2Saved] = useState(10740);
  const [inrRecovered, setInrRecovered] = useState(384289);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Mock user's matches
    const sorted = [...factories].sort((a, b) => b.lat - a.lat).slice(0, 5);
    setMatches(sorted);

    // Simulate match alerts
    const timer = setTimeout(() => {
      setAlerts(['New match found! Apex Chemicals needs your Spent Solvent.']);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-sans font-bold text-foreground">Factory <span className="text-teal-accent">Dashboard</span></h1>
      
      {/* Top Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-accent/80 font-mono mb-1">CO₂ Emissions Saved</p>
              <h3 className="text-3xl font-mono font-bold text-green-accent">
                {co2Saved.toLocaleString()} <span className="text-base text-muted-foreground">kg</span>
              </h3>
            </div>
            <Leaf className="w-10 h-10 text-green-accent/50" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-accent/80 font-mono mb-1">Value Recovered</p>
              <h3 className="text-3xl font-mono font-bold text-amber-accent">
                ₹{inrRecovered.toLocaleString()}
              </h3>
            </div>
            <IndianRupee className="w-10 h-10 text-amber-accent/50" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-center relative w-full h-[120px]">
            <CircularityScoreWidget score={78} />
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl flex items-center gap-3"
        >
          <Bell className="w-5 h-5 animate-bounce" />
          <p className="font-mono text-sm">{alerts[0]}</p>
        </motion.div>
      )}

      {/* Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        
        {/* Left Panel: Matches */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
          
          <div style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:12, padding:'16px 20px', marginBottom:24 }}>
            <div style={{ fontSize:12, color:'#fbbf24', fontWeight:700, marginBottom:10, letterSpacing:1 }}>⏳ PENDING VERIFICATION</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700 }}>Metal Shavings → Rajasthan Cement Corp</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>Inspector assigned · Code: WXINSP4F2A · Awaiting on-site check</div>
              </div>
              <span style={{ background:'rgba(251,191,36,0.1)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)', borderRadius:6, padding:'4px 12px', fontSize:11, fontWeight:700 }}>PENDING</span>
            </div>
          </div>

          <h3 className="font-sans font-bold text-lg mb-4 text-muted-foreground">Active Deals</h3>
          {matches.map((m, idx) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx*0.1 }}>
              <Card className="hover:border-teal-accent/50 transition-colors cursor-pointer group">
                <CardContent className="p-4">
                  <h4 className="font-bold text-foreground group-hover:text-teal-accent transition-colors">{m.name}</h4>
                  <div className="text-xs text-muted-foreground font-mono mt-2 space-y-1">
                    <p>Location: {m.city}</p>
                    <p>Wants: {m.waste_in.join(', ')}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="bg-purple-accent/10 text-purple-accent border border-purple-accent/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      Symbiosis
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-2 relative h-[600px] rounded-xl overflow-hidden border border-teal-accent/20 shadow-lg">
          <DashboardMap source={{lat: sourceLat, lon: sourceLon}} matches={matches} />
        </div>

      </div>
    </div>
  );
}
