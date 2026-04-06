'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const FACTORIES = [
  { id:'f1', name:'Bharat Steel',     city:'Pune',      waste:'Metal Shavings',        x:200, y:150, safe:true  },
  { id:'f2', name:'Kiran Chemicals',  city:'Mumbai',    waste:'Chlorine Compound',      x:400, y:100, safe:true  },
  { id:'f3', name:'Textronics',       city:'Surat',     waste:'Sodium Hydroxide',       x:600, y:200, safe:true  },
  { id:'f4', name:'PharmaGen',        city:'Hyderabad', waste:'Spent Acetone',          x:300, y:300, safe:true  },
  { id:'f5', name:'Indo Auto',        city:'Chennai',   waste:'Coolant Fluid',          x:500, y:350, safe:true  },
  { id:'f6', name:'Rajasthan Cement', city:'Jaipur',    waste:'Fly Ash',                x:150, y:350, safe:true  },
  { id:'f7', name:'NovaChem',         city:'Bengaluru', waste:'Copper Sulfate Sludge',  x:450, y:250, safe:true  },
]

const LINKS = [
  { source:'f1', target:'f6', safe:true  },
  { source:'f4', target:'f5', safe:true  },
  { source:'f6', target:'f7', safe:true  },
  { source:'f2', target:'f7', safe:true  },
]

// The dangerous triangle: f2 (Chlorine) → f7 (receiver) ← f3 (Sodium)
// Chlorine + Sodium at same receiver = toxic gas cascade
const DANGER_LINK = { source:'f3', target:'f7', safe:false }

export default function ImmunePage() {
  const svgRef = useRef<SVGSVGElement>(null)
  const router = useRouter()
  const [alertFired, setAlertFired] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [links, setLinks] = useState(LINKS)
  const [pulseNodes, setPulseNodes] = useState<string[]>([])
  const [log, setLog] = useState<string[]>([
    '✅ Network scan complete — 7 factories, 4 active flows',
    '✅ ChemSafe™ pair checks passed on all flows',
    '✅ City Immune System monitoring active',
  ])

  function getFactory(id: string) { return FACTORIES.find(f => f.id === id)! }

  async function runSimulation() {
    setSimulating(true)
    setAlertFired(false)
    setPulseNodes([])
    setLinks(LINKS)
    setLog(['🔄 Scanning city waste network...'])

    await delay(1000)
    setLog(l => [...l, '📡 New listing detected: Textronics (Surat) → Sodium Hydroxide → NovaChem (Bengaluru)'])

    await delay(1200)
    setLinks(prev => [...prev, DANGER_LINK])
    setLog(l => [...l, '🔍 Running graph analysis — checking all active flow chains...'])

    await delay(1000)
    setLog(l => [...l, '⚠️  Chain detected: Kiran Chemicals → NovaChem ← Textronics'])

    await delay(800)
    setPulseNodes(['f2', 'f3', 'f7'])
    setAlertFired(true)
    setLog(l => [...l,
      '🚨 CASCADE HAZARD: Chlorine Compound + Sodium Hydroxide converging at NovaChem',
      '🧪 Reaction risk: Toxic chlorine gas release — Hazard Level CRITICAL',
      '🛑 Listing BLOCKED — Network alert sent to all 3 factories',
    ])
    setSimulating(false)
  }

  function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

  function reset() {
    setAlertFired(false)
    setSimulating(false)
    setLinks(LINKS)
    setPulseNodes([])
    setLog([
      '✅ Network scan complete — 7 factories, 4 active flows',
      '✅ ChemSafe™ pair checks passed on all flows',
      '✅ City Immune System monitoring active',
    ])
  }

  // D3 force graph
  useEffect(() => {
    if (typeof window === 'undefined') return
    import('d3').then(d3 => {
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()

      const width = svgRef.current?.clientWidth || 700
      const height = 420

      // Position factories manually (no simulation needed — faster)
      const scaleX = (x: number) => (x / 700) * width
      const scaleY = (y: number) => (y / 420) * height

      const positions: Record<string, {x:number,y:number}> = {}
      FACTORIES.forEach(f => { positions[f.id] = { x: scaleX(f.x), y: scaleY(f.y) } })

      // Draw links
      const allLinks = [...links]
      allLinks.forEach(link => {
        const s = positions[link.source]
        const t = positions[link.target]
        const isDanger = !link.safe
        const isInDangerChain = pulseNodes.includes(link.source) && pulseNodes.includes(link.target)

        svg.append('line')
          .attr('x1', s.x).attr('y1', s.y)
          .attr('x2', t.x).attr('y2', t.y)
          .attr('stroke', isDanger || isInDangerChain ? '#fb7185' : '#00e5b0')
          .attr('stroke-width', isDanger || isInDangerChain ? 3 : 1.5)
          .attr('stroke-opacity', isDanger || isInDangerChain ? 0.9 : 0.4)
          .attr('stroke-dasharray', isDanger ? '6,3' : 'none')

        // Arrow label
        const mx = (s.x + t.x) / 2
        const my = (s.y + t.y) / 2
        svg.append('text')
          .attr('x', mx).attr('y', my - 6)
          .attr('fill', isDanger ? '#fb7185' : '#64748b')
          .attr('font-size', '10')
          .attr('text-anchor', 'middle')
          .text(isDanger ? '⚠️ DANGER' : '→')
      })

      // Draw nodes
      FACTORIES.forEach(f => {
        const pos = positions[f.id]
        const isDanger = pulseNodes.includes(f.id)
        const g = svg.append('g').attr('transform', `translate(${pos.x},${pos.y})`)

        // Pulse ring for danger nodes
        if (isDanger) {
          g.append('circle')
            .attr('r', 28)
            .attr('fill', 'none')
            .attr('stroke', '#fb7185')
            .attr('stroke-width', 2)
            .attr('opacity', 0.4)

          g.append('circle')
            .attr('r', 36)
            .attr('fill', 'rgba(251,113,133,0.08)')
            .attr('stroke', '#fb7185')
            .attr('stroke-width', 1)
            .attr('opacity', 0.3)
        }

        // Main circle
        g.append('circle')
          .attr('r', 20)
          .attr('fill', isDanger ? 'rgba(251,113,133,0.15)' : 'rgba(0,229,176,0.08)')
          .attr('stroke', isDanger ? '#fb7185' : '#00e5b0')
          .attr('stroke-width', isDanger ? 2.5 : 1.5)

        // Factory icon
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '16')
          .text('🏭')

        // Name label
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 32)
          .attr('fill', isDanger ? '#fb7185' : '#e2e8f0')
          .attr('font-size', '11')
          .attr('font-weight', isDanger ? 'bold' : 'normal')
          .text(f.name)

        // Waste label
        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 44)
          .attr('fill', '#64748b')
          .attr('font-size', '9')
          .text(f.waste)
      })
    })
  }, [links, pulseNodes])

  return (
    <div style={{ minHeight:'100vh', background:'#070b0f', paddingBottom:60 }}>

      {/* Header */}
      <div style={{ padding:'16px 24px', borderBottom:'1px solid #1a2530', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:20 }}>←</button>
          <div>
            <div style={{ color:'#fb7185', fontWeight:900, fontSize:18 }}>🧬 Industrial Immune System™</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Network-level contamination defence · City waste graph</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={reset} style={{ background:'#111820', color:'#64748b', border:'1px solid #1a2530', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:13 }}>
            Reset
          </button>
          <button
            onClick={runSimulation}
            disabled={simulating}
            style={{ background: simulating ? '#111820' : '#fb7185', color: simulating ? '#64748b' : '#070b0f', border:'none', padding:'8px 20px', borderRadius:8, cursor: simulating ? 'not-allowed' : 'pointer', fontWeight:800, fontSize:13 }}
          >
            {simulating ? '⏳ Scanning...' : '▶ Simulate Cascade Hazard'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 20px' }}>

        {/* Alert Banner */}
        {alertFired && (
          <div style={{ background:'rgba(251,113,133,0.1)', border:'2px solid #fb7185', borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', gap:16, alignItems:'flex-start' }}>
            <div style={{ fontSize:32, flexShrink:0 }}>🚨</div>
            <div>
              <div style={{ fontWeight:900, fontSize:16, color:'#fb7185', marginBottom:4 }}>CASCADE HAZARD DETECTED — 3-NODE CHAIN</div>
              <div style={{ fontSize:13, color:'#e2e8f0', marginBottom:8 }}>
                <strong>Kiran Chemicals</strong> (Chlorine) → <strong>NovaChem</strong> ← <strong>Textronics</strong> (Sodium Hydroxide)
              </div>
              <div style={{ fontSize:12, color:'#64748b' }}>
                Converging waste streams create toxic chlorine gas risk at receiver. Listing blocked. All 3 factories notified.
              </div>
              <div style={{ display:'flex', gap:8, marginTop:12, flexWrap:'wrap' }}>
                <span style={{ background:'rgba(251,113,133,0.1)', color:'#fb7185', border:'1px solid #fb7185', borderRadius:6, padding:'4px 12px', fontSize:11, fontWeight:700 }}>🧪 Reaction: Cl₂ + NaOH → Toxic Gas</span>
                <span style={{ background:'rgba(251,113,133,0.1)', color:'#fb7185', border:'1px solid #fb7185', borderRadius:6, padding:'4px 12px', fontSize:11, fontWeight:700 }}>⚠️ Hazard Level: CRITICAL</span>
                <span style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80', border:'1px solid #4ade80', borderRadius:6, padding:'4px 12px', fontSize:11, fontWeight:700 }}>✅ Listing Auto-Blocked</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { val:'7', label:'Factories Monitored', color:'#00e5b0' },
            { val: String(links.length), label:'Active Flow Chains', color:'#a78bfa' },
            { val: alertFired ? '1' : '0', label:'Cascade Alerts', color: alertFired ? '#fb7185' : '#64748b' },
            { val:'LIVE', label:'Network Status', color:'#4ade80' },
          ].map(s => (
            <div key={s.label} style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:10, padding:'14px', textAlign:'center' }}>
              <div style={{ fontWeight:900, fontSize:20, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10, color:'#64748b', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Graph */}
        <div style={{ background:'#0d1318', border:`1px solid ${alertFired ? '#fb7185' : '#1a2530'}`, borderRadius:14, padding:16, marginBottom:20, transition:'border-color 0.5s' }}>
          <div style={{ fontSize:11, color: alertFired ? '#fb7185' : '#00e5b0', fontWeight:700, marginBottom:12, letterSpacing:1 }}>
            {alertFired ? '🚨 NETWORK ALERT — DANGEROUS TRIANGLE DETECTED' : '📡 CITY WASTE NETWORK — LIVE VIEW'}
          </div>
          <svg ref={svgRef} width="100%" height="420" style={{ display:'block' }} />
          <div style={{ display:'flex', gap:16, marginTop:12, fontSize:11, color:'#64748b' }}>
            <span>🟢 Safe flow</span>
            <span style={{ color:'#fb7185' }}>🔴 Danger chain</span>
            <span>🏭 Factory node</span>
          </div>
        </div>

        {/* System log */}
        <div style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:14, padding:16 }}>
          <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:12, letterSpacing:1 }}>SYSTEM LOG</div>
          <div style={{ fontFamily:'monospace', fontSize:12, display:'flex', flexDirection:'column', gap:6 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ color: entry.includes('🚨') || entry.includes('🛑') || entry.includes('⚠️') ? '#fb7185' : entry.includes('✅') ? '#4ade80' : '#64748b', padding:'4px 0', borderBottom:'1px solid #111820' }}>
                <span style={{ color:'#374151', marginRight:8 }}>{String(i+1).padStart(2,'0')}</span>
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:14, padding:20, marginTop:20 }}>
          <div style={{ fontSize:13, color:'#e2e8f0', fontWeight:700, marginBottom:16 }}>Why ChemSafe alone is not enough</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { icon:'🔍', title:'ChemSafe™', desc:'Checks pairs — A+B safe? Yes. Approved.', color:'#00e5b0', limit:true },
              { icon:'🧬', title:'Immune System™', desc:'Checks the network — A→C and B→C creates toxic triangle? BLOCKED.', color:'#fb7185', limit:false },
            ].map(c => (
              <div key={c.title} style={{ background:'#111820', border:`1px solid ${c.color}30`, borderRadius:10, padding:'14px 16px' }}>
                <div style={{ fontSize:20, marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontWeight:700, color:c.color, marginBottom:6 }}>{c.title}</div>
                <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{c.desc}</div>
                {c.limit && <div style={{ fontSize:11, color:'#fb7185', marginTop:8 }}>⚠️ Node-level only — misses chain reactions</div>}
                {!c.limit && <div style={{ fontSize:11, color:'#4ade80', marginTop:8 }}>✅ Network-level — catches what pairs miss</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
