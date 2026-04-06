"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const KEYWORDS: Record<string,string> = {
  // Metals
  'copper':'Copper Sulfate Sludge','electrochemical':'Copper Sulfate Sludge',
  'pcb':'Copper Sulfate Sludge','circuit':'Copper Sulfate Sludge','blue liquid':'Copper Sulfate Sludge',
  'metal':'Metal Shavings','iron':'Metal Shavings','steel':'Metal Shavings',
  'shaving':'Metal Shavings','scrap':'Metal Shavings','sphere':'Metal Shavings',
  'solid':'Metal Shavings','ball':'Metal Shavings','pellet':'Metal Shavings',
  // Solvents
  'acetone':'Spent Acetone','solvent':'Solvent Waste','coolant':'Coolant Fluid',
  'paint':'Paint Sludge','thinner':'Solvent Waste','liquid':'Solvent Waste',
  'drum':'Solvent Waste','barrel':'Solvent Waste','fluid':'Coolant Fluid',
  // Chemical
  'chemical':'ETP Sludge','acid':'Battery Acid','battery':'Battery Acid',
  'alkaline':'Alkaline Wastewater','water':'Alkaline Wastewater',
  'dye':'Textile Dye Effluent','textile':'Textile Dye Effluent','cloth':'Textile Dye Effluent',
  'fabric':'Textile Dye Effluent','colour':'Textile Dye Effluent','color':'Textile Dye Effluent',
  // Ash / Sludge
  'ash':'Fly Ash','fly ash':'Fly Ash','cement':'Fly Ash','dust':'Fly Ash','powder':'Fly Ash','grey':'Fly Ash','gray':'Fly Ash',
  'sludge':'ETP Sludge','etp':'ETP Sludge','mud':'ETP Sludge','slurry':'ETP Sludge','wet':'ETP Sludge',
  'brown':'ETP Sludge','black':'ETP Sludge','effluent':'ETP Sludge','waste water':'ETP Sludge',
  // Other
  'plastic':'Plastic Granules','rubber':'Rubber Scrap','tyre':'Rubber Scrap','tire':'Rubber Scrap',
  'pharma':'Pharmaceutical Waste','medicine':'Pharmaceutical Waste','pill':'Pharmaceutical Waste',
  // Cosmetic / random objects → map to nearest industrial equivalent
  'lipstick':'Paint Sludge','cosmetic':'Paint Sludge','cream':'Paint Sludge','gel':'Paint Sludge',
  'mental':'ETP Sludge','paper':'ETP Sludge','oil':'Solvent Waste','grease':'Coolant Fluid',
  'glass':'Metal Shavings','ceramic':'Fly Ash','sand':'Fly Ash','stone':'Fly Ash',
  'wood':'Rubber Scrap','organic':'ETP Sludge','bio':'ETP Sludge',
}
const HAZARD: Record<string,number> = {
  'Copper Sulfate Sludge':4,'Metal Shavings':2,'Spent Acetone':4,'Solvent Waste':4,
  'Coolant Fluid':3,'Paint Sludge':3,'Battery Acid':5,'Textile Dye Effluent':3,
  'Fly Ash':2,'ETP Sludge':3,'Plastic Granules':1,'Rubber Scrap':2,
}
const REUSE: Record<string,string[]> = {
  'Copper Sulfate Sludge':['Circuit board mfg','Fertiliser additive'],
  'Metal Shavings':['Foundry input','Scrap recycling'],
  'Spent Acetone':['Solvent recovery','Paint thinner'],
  'Fly Ash':['Cement additive','Road construction'],
  'ETP Sludge':['Brick making','Composting'],
  'Battery Acid':['Battery recycling','Acid neutralisation'],
  'Solvent Waste':['Solvent recovery','Fuel blending'],
  'Textile Dye Effluent':['Dye recovery','Water treatment'],
  'Paint Sludge':['Pigment recovery','Construction fill'],
  'Plastic Granules':['Recycled products','Composites'],
  'Rubber Scrap':['Crumb rubber roads','Retreading'],
}
const EF: Record<string,number> = {
  'Copper Sulfate Sludge':2.8,'Spent Acetone':3.4,'Fly Ash':0.9,
  'Metal Shavings':1.2,'ETP Sludge':2.1,'Solvent Waste':3.2,
  'Textile Dye Effluent':2.6,'Battery Acid':3.0,
}
const HL: Record<number,string> = {1:'Very Safe 🟢',2:'Safe 🟢',3:'Moderate 🟡',4:'Hazardous 🔴',5:'Critical 🔴'}

function detect(text: string): string | null {
  const l = text.toLowerCase().trim()
  // Multi-word first
  for(const [k,v] of Object.entries(KEYWORDS)) {
    if(k.includes(' ') && l.includes(k)) return v
  }
  // Single word — check each word in the message individually
  const words = l.split(/[\s,.\-\/]+/)
  for(const word of words) {
    for(const [k,v] of Object.entries(KEYWORDS)) {
      if(!k.includes(' ') && (word === k || word.startsWith(k) || k.startsWith(word))) return v
    }
  }
  // Partial match fallback — any keyword contained anywhere
  for(const [k,v] of Object.entries(KEYWORDS)) {
    if(l.includes(k)) return v
  }
  return null
}

function getQty(text: string): number {
  const m = text.match(/(\d[\d,]*)\s*(kg|ton|litre|liter|kgs?|g\b)?/i)
  if(m) {
    const n = parseInt(m[1].replace(/,/g,''))
    // If unit is grams convert to kg
    if(m[2]?.toLowerCase() === 'g') return Math.max(1, Math.round(n/1000))
    return n > 0 ? n : 200
  }
  return 200
}

function getBotReply(text: string): { msg: string; showBtn: boolean } {
  const l = text.toLowerCase().trim()

  // Empty or very short
  if(l.length < 2) return { msg:`Please describe your waste — e.g. "500kg fly ash" or "metal drums"`, showBtn:false }

  // Greetings
  if(l.match(/^(hi|hello|hey|yo|sup|start|begin|test)[\s!.]*$/))
    return { msg:`👋 Hi! I'm WasteGPT.\n\nDescribe your industrial waste — type, quantity, and I'll classify it instantly.\n\nExamples:\n• "500kg fly ash daily"\n• "copper sludge from PCB plant"\n• "metal shavings 200kg"`, showBtn:false }

  // Questions about the platform
  if(l.includes('score')||l.includes('symbiosis'))
    return { msg:`📊 Symbiosis Score™ (0–100):\n• 40% — category match\n• 30% — proximity\n• 20% — volume fit\n• 10% — hazard compat\n\n80+ ✅ Excellent\n60–79 🟡 Good\nBelow 60 ⚠️ Marginal`, showBtn:false }

  if(l.includes('co2')||l.includes('carbon')||l.includes('emission'))
    return { msg:`🌿 CO₂ Saved = (kg × emission factor) − (km × 0.21)\n\nCarbon credit = ₹0.85 per kg CO₂ (India rate)\n\nExample: 500kg Fly Ash → saves ~450kg CO₂ → ₹382 credit`, showBtn:false }

  if(l.includes('hazard')||l.includes('danger')||l.includes('safe'))
    return { msg:`⚠️ Hazard Levels:\n🟢 1–2: Safe — minimal handling\n🟡 3: Moderate — use PPE\n🔴 4: Hazardous — strict compliance\n🔴 5: Critical — regulatory approval\n\nChemSafe™ blocks all dangerous pairs.`, showBtn:false }

  if(l.includes('chemsafe'))
    return { msg:`🛡️ ChemSafe™ automatically blocks reactive waste pairs.\n\nE.g. Battery Acid + Alkaline Wastewater = ❌ blocked\n\nEvery match is safety-verified before showing to you.`, showBtn:false }

  if(l.match(/\b(yes|yep|sure|ok|okay|find|match|proceed|show|go)\b/))
    return { msg:`🔍 Finding your best circular economy matches now!\n\nClick below to see top factories ranked by Symbiosis Score™`, showBtn:true }

  // Try to detect waste type
  const type = detect(text)
  if(type) {
    const qty = getQty(text)
    const h = HAZARD[type] ?? 3
    const r = REUSE[type] ?? ['Industrial reuse','Material recovery']
    const co2 = Math.round(qty * (EF[type] ?? 1.5))
    const inr = Math.round(co2 * 0.85)
    const hLabel = HL[h]
    return {
      msg:`✅ Waste Classified!\n\n🗂 Type: ${type}\n📦 Quantity: ${qty} kg\n⚠️ Hazard: ${hLabel}\n\n♻️ Best reuse:\n• ${r[0]}\n• ${r[1]}\n\n🌿 CO₂ saved: ${co2} kg\n💰 Credit: ₹${inr.toLocaleString()}\n\nWant to find buyers?`,
      showBtn:true
    }
  }

  // Smart fallback — acknowledge what they said
  return {
    msg:`I couldn't identify a standard industrial waste type from "${text.slice(0,30)}...".\n\nTry describing it as:\n• Material type (metal, chemical, ash, sludge)\n• Quantity in kg\n• Source process\n\nExamples:\n• "copper sludge 500kg"\n• "grey powder from kiln"\n• "liquid waste from dyeing"`,
    showBtn:false
  }
}

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  showBtn?: boolean;
};

export default function WasteGPTWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: 'bot',
      text: "👋 Hi! I'm WasteGPT. Describe your waste to classify it and find buyers!"
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: userText }]);
    
    setTimeout(() => {
      const reply = getBotReply(userText);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: reply.msg,
        showBtn: reply.showBtn
      }]);
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', pointerEvents: 'none', fontFamily: 'system-ui, sans-serif' }}>
      {/* Chat Panel */}
      <div 
        style={{
          width: '340px',
          height: '480px',
          backgroundColor: '#0d1318',
          borderRadius: '16px',
          border: '1px solid #1a2530',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
        {/* Header bar */}
        <div style={{ 
          background: 'linear-gradient(to right, #004d40, #00e5b0)', 
          padding: '12px 16px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: '#070b0f'
        }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>♻ WasteGPT</h3>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#070b0f', 
              fontSize: '24px', 
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0
            }}
          >
            ×
          </button>
        </div>

        {/* Message list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div 
                style={{
                  maxWidth: '85%',
                  padding: '10px 12px',
                  whiteSpace: 'pre-line',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  ...(msg.sender === 'user' 
                    ? { backgroundColor: '#00e5b0', color: '#070b0f', borderRadius: '12px 4px 12px 12px' } 
                    : { backgroundColor: '#111820', color: 'white', borderRadius: '4px 12px 12px 12px' }
                  )
                }}
              >
                {msg.text}
                {msg.showBtn && (
                  <button 
                    onClick={() => {
                        setIsOpen(false);
                        router.push('/matches');
                    }}
                    style={{
                      display: 'block',
                      marginTop: '8px',
                      backgroundColor: '#00e5b0',
                      color: '#070b0f',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    🔍 Find Matches →
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input row */}
        <div style={{ padding: '12px', backgroundColor: '#0d1318', borderTop: '1px solid #1a2530', display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            style={{
              flex: 1,
              backgroundColor: '#111820',
              border: '1px solid #1a2530',
              borderRadius: '20px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#00e5b0'}
            onBlur={e => e.target.style.borderColor = '#1a2530'}
          />
          <button
            onClick={handleSend}
            style={{
              backgroundColor: '#00e5b0',
              color: '#070b0f',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#00e5b0',
          color: '#070b0f',
          border: 'none',
          boxShadow: '0 0 20px rgba(0,229,176,0.4)',
          fontSize: isOpen ? '32px' : '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          pointerEvents: 'auto',
          lineHeight: '1',
          paddingBottom: isOpen ? '4px' : '0'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? '×' : '♻'}
      </button>
    </div>
  );
}
