"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, AlertTriangle, Scale, MapPin } from 'lucide-react';
import wasteTypes from '@/data/waste_types.json';

export default function ListWastePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    factoryName: '',
    waste_type: '',
    hazard_level: '1',
    volume_kg: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState<any[]>([]);

  useEffect(() => {
    // Just a sample for the dropdown
    setTypes(wasteTypes.slice(0, 20));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waste_type: formData.waste_type,
          hazard_level: Number(formData.hazard_level),
          volume_kg: Number(formData.volume_kg),
          pincode: formData.pincode
        })
      });
      
      const data = await res.json();
      sessionStorage.setItem('current_waste', JSON.stringify(data.canonical_waste_object));
      router.push('/matches');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-6 py-12">
      <Card className="border-teal-accent/30 shadow-lg shadow-teal-accent/5">
        <CardHeader className="text-center pb-8 border-b border-white/5 mb-6">
          <Leaf className="w-12 h-12 text-teal-accent mx-auto mb-4" />
          <CardTitle className="text-3xl">List Your Waste</CardTitle>
          <p className="text-muted-foreground mt-2 font-mono text-sm">Turn your byproduct into a verified resource</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-accent">Factory Name</label>
              <input 
                required
                className="w-full bg-surface border border-white/10 rounded-md p-3 text-foreground focus:outline-none focus:border-teal-accent"
                placeholder="e.g. Apex Manufacturing"
                value={formData.factoryName}
                onChange={e => setFormData({...formData, factoryName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-accent">Waste Type</label>
              <select 
                required
                className="w-full bg-surface border border-white/10 rounded-md p-3 text-foreground focus:outline-none focus:border-teal-accent"
                value={formData.waste_type}
                onChange={e => setFormData({...formData, waste_type: e.target.value})}
              >
                <option value="" disabled>Select material...</option>
                {types.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-teal-accent flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Volume (kg)
                </label>
                <input 
                  type="number"
                  required
                  min="1"
                  className="w-full bg-surface border border-white/10 rounded-md p-3 text-foreground focus:outline-none focus:border-teal-accent"
                  placeholder="e.g. 500"
                  value={formData.volume_kg}
                  onChange={e => setFormData({...formData, volume_kg: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-teal-accent flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location Pincode
                </label>
                <input 
                  required
                  pattern="[0-9]{6}"
                  className="w-full bg-surface border border-white/10 rounded-md p-3 text-foreground focus:outline-none focus:border-teal-accent"
                  placeholder="e.g. 395003"
                  value={formData.pincode}
                  onChange={e => setFormData({...formData, pincode: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-teal-accent flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Hazard Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, hazard_level: level.toString()})}
                    className={`p-3 rounded-md border text-center font-mono transition-all ${
                      formData.hazard_level === level.toString() 
                        ? 'bg-teal-accent/20 border-teal-accent text-teal-accent' 
                        : 'bg-surface border-white/10 hover:border-white/30 text-muted-foreground'
                    }`}
                  >
                    Class {level}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              variant="accent" 
              className="w-full h-12 text-lg mt-4"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Classifying...</span>
              ) : (
                'Classify & Find Matches'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
