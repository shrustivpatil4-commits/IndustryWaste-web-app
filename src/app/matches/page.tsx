"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, ArrowRight, IndianRupee, Leaf, MapPin, Download } from 'lucide-react';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wasteContext, setWasteContext] = useState<any>(null);
  const [chemSafeAlert, setChemSafeAlert] = useState<any>(null);
  const [confirmingFactory, setConfirmingFactory] = useState<string | null>(null);
  const [dealSuccess, setDealSuccess] = useState<any>(null);

  useEffect(() => {
    const wasteStr = sessionStorage.getItem('current_waste');
    if (!wasteStr) {
      router.push('/list-waste');
      return;
    }
    
    const waste = JSON.parse(wasteStr);
    setWasteContext(waste);

    fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(waste)
    })
    .then(r => r.json())
    .then(data => {
      setMatches(data);
      setLoading(false);
      
      // Check ChemSafe for top match
      if (data.length > 0) {
        checkChemSafe(waste, data[0]);
      }
    });
  }, [router]);

  const checkChemSafe = async (waste: any, topMatch: any) => {
    try {
      const res = await fetch(`/api/chemsafe?waste_type_a=${encodeURIComponent(waste.id)}&waste_type_b=${encodeURIComponent(topMatch.waste_in[0])}`);
      const data = await res.json();
      if (!data.safe) {
        setChemSafeAlert(data);
      }
    } catch(e) {}
  };

  const confirmDeal = async (match: any) => {
    setConfirmingFactory(match.factory_id);
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const dealId = 'WX' + Date.now().toString(36).toUpperCase()
    sessionStorage.setItem('currentDealId', dealId)
    sessionStorage.setItem('confirmedMatch', JSON.stringify({
      wasteA: { wasteType: wasteContext.name, quantityKg: wasteContext.volume_offered },
      factoryA: { name: 'Your Factory', city: 'Producer City' },
      factoryB: { name: match.factory_name, city: match.city },
      symbiosisScore: match.symbiosis_score,
      co2SavedKg: match.co2_saved_kg,
      inrValue: match.carbon_credit_inr
    }))
    router.push(`/verify/${dealId}`)
  };

  const downloadCertificate = async () => {
    const res = await fetch('/api/certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealSuccess)
    });
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WasteExchange_Certificate_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    router.push('/dashboard');
  };

  if (dealSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-surface border border-teal-accent/30 p-8 rounded-2xl shadow-lg text-center"
        >
          <div className="w-20 h-20 bg-teal-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-accent" />
          </div>
          <h2 className="text-3xl font-sans font-bold text-teal-accent mb-2">Deal Confirmed!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            ♻ {dealSuccess.volume} kg diverted from landfill to {dealSuccess.factory_name}.
          </p>
          
          <div className="bg-green-accent/10 p-4 rounded-xl mb-8 border border-green-accent/20">
            <div className="flex items-center justify-center gap-2 text-green-accent font-bold mb-1">
              <Leaf className="w-5 h-5" /> Environmental Impact
            </div>
            <p className="text-foreground">
              {dealSuccess.co2_saved_kg} kg CO₂ saved = ₹{dealSuccess.carbon_credit_inr} carbon credit
            </p>
          </div>
          
          <Button variant="accent" className="w-full gap-2 h-12" onClick={downloadCertificate}>
            <Download className="w-5 h-5" />
            Download Certificate
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-6 py-10 space-y-8">
      <h1 className="text-4xl font-sans font-bold text-foreground">Symbiosis <span className="text-teal-accent">Matches</span></h1>
      
      <AnimatePresence>
        {chemSafeAlert && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0] }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full bg-red-950/50 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-start gap-4 mb-8"
          >
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-red-400">⚠ ChemSafe™ Alert: These materials are incompatible</h4>
              <p className="text-sm text-red-300 mt-1">{chemSafeAlert.warning}</p>
              <p className="text-xs text-red-400/80 mt-1 font-mono">{chemSafeAlert.handling_sop}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center font-mono animate-pulse text-teal-accent pt-12">
          Running algorithm... Matchmaking in progress...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matches.map((match, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              key={match.factory_id}
            >
               <Card className="hover:border-teal-accent/50 transition-colors group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-accent/5 rounded-bl-full -z-10 group-hover:bg-teal-accent/10 transition-colors" />
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    
                    {/* Ring UI */}
                    <div className="shrink-0 flex flex-col items-center justify-center w-28">
                       <div 
                         className="w-20 h-20 rounded-full flex items-center justify-center font-mono font-bold text-2xl text-teal-accent relative group-hover:shadow-[0_0_15px_rgba(0,229,176,0.5)] transition-shadow duration-500"
                         style={{ 
                           background: `conic-gradient(#00e5b0 ${match.symbiosis_score}%, #0d1318 ${match.symbiosis_score}% 100%)`, 
                           padding: '3px' 
                         }}
                       >
                         <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
                           {match.symbiosis_score}
                         </div>
                       </div>
                       <span className="text-xs text-muted-foreground mt-2 font-mono text-center">Symbiosis<br/>Score</span>
                    </div>

                    <div className="flex-1 space-y-2">
                       <div className="flex justify-between items-start">
                         <div>
                            <h3 className="text-xl font-bold font-sans text-foreground">{match.factory_name}</h3>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1 font-mono">
                               <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {match.city} ({match.distance_km} km)</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-accent font-bold text-xl justify-end">
                               <IndianRupee className="w-5 h-5" /> {match.price_offered_inr.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">Offered Price</p>
                         </div>
                       </div>

                       <div className="flex gap-3 pt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-accent/10 text-green-accent text-xs font-medium border border-green-accent/20">
                             <Leaf className="w-3 h-3" /> {match.co2_saved_kg} kg CO₂ saved
                          </span>
                          {match.hazard_compatible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-accent/10 text-teal-accent text-xs font-medium border border-teal-accent/20">
                               <CheckCircle className="w-3 h-3" /> ✓ ChemSafe
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                               <AlertTriangle className="w-3 h-3" /> ⚠ Incompatible
                            </span>
                          )}
                       </div>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                       <Button 
                         variant="accent" 
                         className="w-full md:w-auto"
                         disabled={confirmingFactory !== null}
                         onClick={() => confirmDeal(match)}
                       >
                         {confirmingFactory === match.factory_id ? (
                           <span className="animate-pulse">Confirming...</span>
                         ) : (
                           'Confirm Deal'
                         )}
                       </Button>
                    </div>

                  </CardContent>
               </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
