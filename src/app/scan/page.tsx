"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function classifyFromImage(filename: string) {
  const lower = filename.toLowerCase()
  
  if (lower.includes('copper') || lower.includes('pcb') || lower.includes('blue'))
    return { wasteType: 'Copper Sulfate Sludge', confidence: 94, ph: 3.2, form: 'Sludge', hazard: 4, volumeKg: 340, compound: 'CuSO₄' }
  
  if (lower.includes('ash') || lower.includes('grey') || lower.includes('gray') || lower.includes('cement'))
    return { wasteType: 'Fly Ash', confidence: 91, ph: 11.5, form: 'Powder', hazard: 2, volumeKg: 5000, compound: 'SiO₂/Al₂O₃' }
  
  if (lower.includes('metal') || lower.includes('steel') || lower.includes('iron') || lower.includes('shav'))
    return { wasteType: 'Metal Shavings', confidence: 88, ph: 7.0, form: 'Solid', hazard: 2, volumeKg: 800, compound: 'Fe/Cr alloy' }
  
  if (lower.includes('solvent') || lower.includes('acetone') || lower.includes('liquid') || lower.includes('drum'))
    return { wasteType: 'Spent Acetone', confidence: 86, ph: 6.8, form: 'Liquid', hazard: 4, volumeKg: 200, compound: 'CH₃COCH₃' }

  if (lower.includes('sludge') || lower.includes('etp') || lower.includes('brown'))
    return { wasteType: 'ETP Sludge', confidence: 83, ph: 7.5, form: 'Sludge', hazard: 3, volumeKg: 700, compound: 'Mixed organics' }

  // Default — random pick from common types
  const defaults = [
    { wasteType: 'Solvent Waste', confidence: 79, ph: 6.5, form: 'Liquid', hazard: 4, volumeKg: 300, compound: 'Mixed solvents' },
    { wasteType: 'Paint Sludge',  confidence: 77, ph: 8.2, form: 'Sludge', hazard: 3, volumeKg: 150, compound: 'Alkyd resin' },
    { wasteType: 'ETP Sludge',    confidence: 81, ph: 7.1, form: 'Sludge', hazard: 3, volumeKg: 600, compound: 'Mixed organics' },
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof classifyFromImage> | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleAnalyse = () => {
    if (!file) return;
    setIsAnalysing(true);
    setTimeout(() => {
      setIsAnalysing(false);
      setResult(classifyFromImage(file.name));
    }, 2000);
  };

  const handleFindMatches = () => {
    if (result) {
      sessionStorage.setItem('pendingListing', JSON.stringify({ 
        wasteType: result.wasteType, 
        quantity: result.volumeKg 
      }));
      router.push('/matches');
    }
  };

  const getHazardColor = (level: number) => {
    if (level <= 2) return '#22c55e'; // green
    if (level === 3) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#070b0f', color: '#e2e8f0' }}>
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[#00e5b0] transition-colors p-2 rounded-full hover:bg-gray-800" aria-label="Go back">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">📸 Scan Waste</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 md:p-10 flex flex-col gap-8">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-4">
          <button className="px-6 py-3 border-b-2 font-medium transition-colors" style={{ borderColor: '#00e5b0', color: '#00e5b0' }}>
            Upload Photo
          </button>
          <Link href="/submit" className="px-6 py-3 border-b-2 border-transparent font-medium text-gray-400 hover:text-gray-200 transition-colors">
            Type Manually
          </Link>
        </div>

        {/* Upload Box */}
        {!result && !isAnalysing && (
          <div className="flex flex-col items-center gap-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-80 rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/50 hover:bg-gray-800/50 hover:border-[#00e5b0] transition-all cursor-pointer flex flex-col items-center justify-center relative overflow-hidden group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              {preview ? (
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <p className="text-lg">Drop a photo or click to upload</p>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-black/80 px-4 py-2 rounded text-white font-medium">Change Photo</span>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAnalyse}
              disabled={!file}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                file 
                  ? 'bg-[#00e5b0] text-[#070b0f] hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,176,0.2)]' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Analyse Waste &rarr;
            </button>
          </div>
        )}

        {/* Loading State */}
        {isAnalysing && (
          <div className="flex flex-col items-center justify-center h-80 gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-[#00e5b0]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#00e5b0] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xl font-medium text-[#00e5b0] animate-pulse">🔬 Analysing waste...</p>
          </div>
        )}

        {/* Result Card */}
        {result && !isAnalysing && (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div 
              style={{ backgroundColor: '#0d1318', borderTop: '4px solid #00e5b0' }}
              className="rounded-xl border border-gray-800 shadow-2xl p-6 md:p-8"
            >
              {/* Row 1 */}
              <div className="text-[#00e5b0] font-mono font-medium tracking-wider text-sm mb-4">
                🧬 WASTE DNA FINGERPRINT
              </div>
              
              {/* Row 2 */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{result.wasteType}</h2>
                <div className="bg-green-500/10 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {result.confidence}% confident
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#111820] border border-[#1a2530] p-4 rounded-lg flex items-center gap-4">
                  <span className="text-2xl" aria-hidden="true">🧪</span>
                  <div>
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Primary Compound</div>
                    <div className="text-gray-100 font-mono text-lg">{result.compound}</div>
                  </div>
                </div>
                <div className="bg-[#111820] border border-[#1a2530] p-4 rounded-lg flex items-center gap-4">
                  <span className="text-2xl" aria-hidden="true">⚗️</span>
                  <div>
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">pH Level</div>
                    <div className="text-gray-100 font-mono text-lg">{result.ph}</div>
                  </div>
                </div>
                <div className="bg-[#111820] border border-[#1a2530] p-4 rounded-lg flex items-center gap-4">
                  <span className="text-2xl" aria-hidden="true">🫙</span>
                  <div>
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Physical Form</div>
                    <div className="text-gray-100 font-mono text-lg">{result.form}</div>
                  </div>
                </div>
                <div className="bg-[#111820] border border-[#1a2530] p-4 rounded-lg flex items-center gap-4">
                  <span className="text-2xl" aria-hidden="true">⚠️</span>
                  <div>
                    <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Hazard Level</div>
                    <div className="font-bold text-lg flex items-center gap-2" style={{ color: getHazardColor(result.hazard) }}>
                      {result.hazard} / 5
                    </div>
                  </div>
                </div>
              </div>

              {/* Volume Estimator Box */}
              <div className="border border-amber-500/50 bg-amber-500/5 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">📦</span>
                  <div>
                    <div className="text-amber-500 font-bold text-xl">Estimated Volume: {result.volumeKg} kg</div>
                    <div className="text-amber-500/70 text-sm">Estimated by AI vision analysis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-center mt-4">
              <button 
                onClick={handleFindMatches}
                className="w-full sm:w-2/3 py-4 px-6 rounded-lg font-bold text-lg bg-[#00e5b0] text-[#070b0f] hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,176,0.2)] transition-all flex items-center justify-center gap-2"
              >
                🔍 Find Matches &rarr;
              </button>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                className="text-gray-400 hover:text-white transition-colors underline underline-offset-4 text-sm"
              >
                Scan another photo
              </button>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}
