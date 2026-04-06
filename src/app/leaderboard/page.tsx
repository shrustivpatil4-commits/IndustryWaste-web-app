'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FACTORIES = [
  { rank:1, name:'Bharat Steel Works',       city:'Pune',      state:'MH', industry:'Steel',       kgDiverted:12400, co2Saved:14880, inrRecovered:126480, deals:18, badge:'🥇', trend:'↑' },
  { rank:2, name:'Gujarat Solvent Recyclers', city:'Vadodara',  state:'GJ', industry:'Chemical',    kgDiverted:9800,  co2Saved:31360, inrRecovered:98000,  deals:14, badge:'🥈', trend:'↑' },
  { rank:3, name:'NovaChem Electronics',      city:'Bengaluru', state:'KA', industry:'Electronics', kgDiverted:8200,  co2Saved:17220, inrRecovered:69700,  deals:11, badge:'🥉', trend:'↓' },
  { rank:4, name:'Indo Auto Components',      city:'Chennai',   state:'TN', industry:'Auto',        kgDiverted:7600,  co2Saved:9120,  inrRecovered:64600,  deals:9,  badge:'',   trend:'↑' },
  { rank:5, name:'Kiran Chemicals Ltd',       city:'Mumbai',    state:'MH', industry:'Chemical',    kgDiverted:6100,  co2Saved:17080, inrRecovered:51850,  deals:8,  badge:'',   trend:'→' },
  { rank:6, name:'PharmaGen Industries',      city:'Hyderabad', state:'TS', industry:'Pharma',      kgDiverted:4900,  co2Saved:15680, inrRecovered:41650,  deals:7,  badge:'',   trend:'↑' },
  { rank:7, name:'Textronics Fabric Co.',     city:'Surat',     state:'GJ', industry:'Textile',     kgDiverted:3800,  co2Saved:9880,  inrRecovered:32300,  deals:5,  badge:'',   trend:'↓' },
  { rank:8, name:'Rajasthan Cement Corp',     city:'Jaipur',    state:'RJ', industry:'Cement',      kgDiverted:2900,  co2Saved:2610,  inrRecovered:24650,  deals:4,  badge:'',   trend:'→' },
]

const CITIES = [
  { rank:1, city:'Mumbai',    state:'MH', factories:24, kgDiverted:48200, co2Saved:144600, circularityScore:87, badge:'🥇', trend:'↑' },
  { rank:2, city:'Pune',      state:'MH', factories:18, kgDiverted:38900, co2Saved:116700, circularityScore:81, badge:'🥈', trend:'↑' },
  { rank:3, city:'Bengaluru', state:'KA', factories:21, kgDiverted:34100, co2Saved:102300, circularityScore:76, badge:'🥉', trend:'↑' },
  { rank:4, city:'Surat',     state:'GJ', factories:16, kgDiverted:28700, co2Saved:86100,  circularityScore:71, badge:'',   trend:'↓' },
  { rank:5, city:'Chennai',   state:'TN', factories:14, kgDiverted:22400, co2Saved:67200,  circularityScore:65, badge:'',   trend:'→' },
  { rank:6, city:'Hyderabad', state:'TS', factories:12, kgDiverted:18900, co2Saved:56700,  circularityScore:61, badge:'',   trend:'↑' },
  { rank:7, city:'Jaipur',    state:'RJ', factories:9,  kgDiverted:12300, co2Saved:36900,  circularityScore:54, badge:'',   trend:'→' },
  { rank:8, city:'Vadodara',  state:'GJ', factories:8,  kgDiverted:9800,  co2Saved:29400,  circularityScore:49, badge:'',   trend:'↓' },
]

function ScoreBar({ score, max, color }: { score:number; max:number; color:string }) {
  return (
    <div style={{ background:'#111820', borderRadius:4, height:6, width:80, overflow:'hidden' }}>
      <div style={{ height:'100%', borderRadius:4, background:color, width:`${(score/max)*100}%`, transition:'width 0.5s' }} />
    </div>
  )
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'factory'|'city'>('factory')
  const [sortBy, setSortBy] = useState<'kg'|'co2'|'inr'>('kg')
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sorted = [...FACTORIES].sort((a,b) =>
    sortBy === 'kg' ? b.kgDiverted - a.kgDiverted :
    sortBy === 'co2' ? b.co2Saved - a.co2Saved :
    b.inrRecovered - a.inrRecovered
  ).map((f,i) => ({ ...f, rank:i+1 }))

  const trendColor = (t:string) => t==='↑'?'#4ade80':t==='↓'?'#fb7185':'#64748b'

  return (
    <div style={{ minHeight:'100vh', background:'#070b0f', paddingBottom:60 }}>

      {/* Header */}
      <div style={{ padding:'16px 24px', borderBottom:'1px solid #1a2530', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:20 }}>←</button>
          <div>
            <div style={{ color:'#fbbf24', fontWeight:900, fontSize:18 }}>🏆 City Circularity Leaderboard</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Live · Public · Updated every hour</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 6px #4ade80' }} />
          <span style={{ fontSize:12, color:'#4ade80', fontWeight:700 }}>LIVE</span>
          <button onClick={copyLink} style={{ background:'#111820', color: copied?'#4ade80':'#e2e8f0', border:'1px solid #1a2530', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12 }}>
            {copied ? '✅ Copied!' : '🔗 Share Link'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'24px 20px' }}>

        {/* Platform totals */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { val:'55,600 kg', label:'Total Diverted',    color:'#00e5b0' },
            { val:'108 t CO₂', label:'Carbon Saved',      color:'#4ade80' },
            { val:'₹5.08L',    label:'Value Recovered',   color:'#fbbf24' },
            { val:'76 deals',  label:'Completed Deals',   color:'#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:10, padding:'14px', textAlign:'center' }}>
              <div style={{ fontWeight:900, fontSize:16, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:10, color:'#64748b', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20 }}>
          {(['factory','city'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab===t ? '#fbbf24' : '#111820', color: tab===t ? '#070b0f' : '#64748b', border:'1px solid #1a2530', padding:'9px 24px', borderRadius:8, cursor:'pointer', fontWeight:800, fontSize:13, textTransform:'capitalize' }}>
              {t === 'factory' ? '🏭 Factory Rankings' : '🏙️ City Rankings'}
            </button>
          ))}
        </div>

        {/* FACTORY TAB */}
        {tab === 'factory' && (
          <>
            {/* Sort */}
            <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#64748b' }}>Sort by:</span>
              {[{key:'kg',label:'kg Diverted'},{key:'co2',label:'CO₂ Saved'},{key:'inr',label:'₹ Recovered'}].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key as any)} style={{ background: sortBy===s.key?'#0d1318':'transparent', color: sortBy===s.key?'#fbbf24':'#64748b', border:`1px solid ${sortBy===s.key?'#fbbf24':'#1a2530'}`, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight: sortBy===s.key?700:400 }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Factory rows */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {sorted.map((f, i) => (
                <div key={f.name} style={{ background:'#0d1318', border:`1px solid ${i<3?'rgba(251,191,36,0.3)':'#1a2530'}`, borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, transition:'all 0.2s' }}>

                  {/* Rank */}
                  <div style={{ width:32, textAlign:'center', flexShrink:0 }}>
                    {f.badge ? (
                      <span style={{ fontSize:22 }}>{f.badge}</span>
                    ) : (
                      <span style={{ fontSize:16, fontWeight:900, color:'#64748b' }}>#{f.rank}</span>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ fontWeight:800, fontSize:14, color:'#e2e8f0' }}>{f.name}</span>
                      <span style={{ fontSize:14, color:trendColor(f.trend), fontWeight:700 }}>{f.trend}</span>
                    </div>
                    <div style={{ fontSize:11, color:'#64748b' }}>{f.city}, {f.state} · {f.industry} · {f.deals} deals</div>
                  </div>

                  {/* Metrics */}
                  <div style={{ display:'flex', gap:20, flexShrink:0 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:800, color:'#00e5b0', fontSize:13 }}>{f.kgDiverted.toLocaleString()}</div>
                      <div style={{ fontSize:9, color:'#64748b' }}>kg diverted</div>
                      <ScoreBar score={f.kgDiverted} max={12400} color='#00e5b0' />
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:800, color:'#4ade80', fontSize:13 }}>{f.co2Saved.toLocaleString()}</div>
                      <div style={{ fontSize:9, color:'#64748b' }}>kg CO₂</div>
                      <ScoreBar score={f.co2Saved} max={31360} color='#4ade80' />
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:800, color:'#fbbf24', fontSize:13 }}>₹{(f.inrRecovered/1000).toFixed(0)}k</div>
                      <div style={{ fontSize:9, color:'#64748b' }}>recovered</div>
                      <ScoreBar score={f.inrRecovered} max={126480} color='#fbbf24' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CITY TAB */}
        {tab === 'city' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {CITIES.map((c, i) => (
              <div key={c.city} style={{ background:'#0d1318', border:`1px solid ${i<3?'rgba(251,191,36,0.3)':'#1a2530'}`, borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>

                {/* Rank */}
                <div style={{ width:32, textAlign:'center', flexShrink:0 }}>
                  {c.badge ? <span style={{ fontSize:22 }}>{c.badge}</span> : <span style={{ fontSize:16, fontWeight:900, color:'#64748b' }}>#{c.rank}</span>}
                </div>

                {/* City info */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontWeight:800, fontSize:15 }}>{c.city}</span>
                    <span style={{ fontSize:11, color:'#64748b' }}>{c.state}</span>
                    <span style={{ fontSize:13, color:trendColor(c.trend), fontWeight:700 }}>{c.trend}</span>
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{c.factories} factories · {c.kgDiverted.toLocaleString()} kg diverted · {c.co2Saved.toLocaleString()} kg CO₂</div>
                </div>

                {/* Circularity Score */}
                <div style={{ textAlign:'center', flexShrink:0 }}>
                  <div style={{ position:'relative', width:56, height:56, margin:'0 auto' }}>
                    <svg width="56" height="56" style={{ transform:'rotate(-90deg)' }}>
                      <circle cx="28" cy="28" r="22" fill="none" stroke="#1a2530" strokeWidth="5" />
                      <circle cx="28" cy="28" r="22" fill="none"
                        stroke={c.circularityScore>=75?'#4ade80':c.circularityScore>=60?'#fbbf24':'#fb7185'}
                        strokeWidth="5"
                        strokeDasharray={`${(c.circularityScore/100)*138} 138`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position:'absolute', top:0, left:0, width:56, height:56, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:13, fontWeight:900, color: c.circularityScore>=75?'#4ade80':c.circularityScore>=60?'#fbbf24':'#fb7185' }}>{c.circularityScore}</span>
                    </div>
                  </div>
                  <div style={{ fontSize:9, color:'#64748b', marginTop:4 }}>circularity</div>
                </div>
              </div>
            ))}

            {/* City score legend */}
            <div style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:10, padding:'12px 16px', marginTop:8, display:'flex', gap:20, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, color:'#64748b' }}>Circularity Score =</span>
              <span style={{ fontSize:11, color:'#4ade80' }}>≥75 Excellent</span>
              <span style={{ fontSize:11, color:'#fbbf24' }}>60–74 Good</span>
              <span style={{ fontSize:11, color:'#fb7185' }}>Below 60 Needs work</span>
            </div>
          </div>
        )}

        {/* Public URL banner */}
        <div style={{ background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:12, padding:'14px 18px', marginTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <div style={{ fontSize:12, color:'#fbbf24', fontWeight:700, marginBottom:2 }}>🌐 PUBLIC LEADERBOARD URL</div>
            <div style={{ fontSize:12, color:'#64748b', fontFamily:'monospace' }}>wastexchange.vercel.app/leaderboard</div>
          </div>
          <button onClick={copyLink} style={{ background:'#fbbf24', color:'#070b0f', border:'none', padding:'8px 20px', borderRadius:8, fontWeight:800, cursor:'pointer', fontSize:13 }}>
            {copied ? '✅ Copied!' : '🔗 Copy & Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
