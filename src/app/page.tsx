"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Recycle, IndianRupee } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [divertedKg, setDivertedKg] = useState(12400);
  const [co2Saved, setCo2Saved] = useState(10400);
  const [inrRecovered, setInrRecovered] = useState(384000);

  useEffect(() => {
    const interval = setInterval(() => {
      const incKg = Math.floor(Math.random() * 5) + 1;
      setDivertedKg(prev => prev + incKg);
      setCo2Saved(prev => prev + Math.floor(incKg * 2.1));
      setInrRecovered(prev => prev + Math.floor(incKg * 12));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-accent/10 text-teal-accent text-sm font-medium border border-teal-accent/20 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-accent"></span>
          </span>
          Live Exchange Ecosystem
        </div>

        <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-accent via-white to-purple-accent">
          Turn Pollution Into Profit
        </h1>
        
        <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
          The AI-powered industrial waste brokerage platform. One factory's chemical waste becomes another factory's raw material.
        </p>

        <div className="pt-8 pb-12 flex justify-center">
          <Button 
            variant="accent" 
            size="lg" 
            className="h-14 px-8 text-lg rounded-full group"
            onClick={() => router.push('/list-waste')}
          >
            List Your Waste
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-teal-accent/10">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-surface/50 border border-teal-accent/10 backdrop-blur"
          >
            <Recycle className="h-8 w-8 text-teal-accent mx-auto mb-4" />
            <h3 className="text-3xl font-mono font-bold text-foreground">
              {divertedKg.toLocaleString()} <span className="text-lg text-muted-foreground">kg</span>
            </h3>
            <p className="text-sm text-teal-accent/80 mt-2">Diverted from landfill</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-surface/50 border border-green-accent/10 backdrop-blur"
          >
            <Leaf className="h-8 w-8 text-green-accent mx-auto mb-4" />
            <h3 className="text-3xl font-mono font-bold text-foreground">
              {co2Saved.toLocaleString()} <span className="text-lg text-muted-foreground">kg</span>
            </h3>
            <p className="text-sm text-green-accent/80 mt-2">CO₂ Emissions Saved</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-2xl bg-surface/50 border border-amber-accent/10 backdrop-blur"
          >
            <span className="text-amber-accent font-bold text-3xl block mb-4">₹</span>
            <h3 className="text-3xl font-mono font-bold text-foreground">
              {inrRecovered.toLocaleString()}
            </h3>
            <p className="text-sm text-amber-accent/80 mt-2">Value Recovered</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
