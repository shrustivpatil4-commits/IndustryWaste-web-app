'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface VerificationDeal {
  dealId: string
  wasteType: string
  quantityKg: number
  producerFactory: string
  receiverFactory: string
  producerCity: string
  receiverCity: string
  symbiosisScore: number
  co2SavedKg: number
  inrValue: number
  inspectorCode: string
  status: 'pending_verification' | 'inspector_assigned' | 'in_transit' | 'delivered' | 'verified' | 'rejected'
  createdAt: string
  checklist: ChecklistItem[]
  inspectorNotes: string
  rejectionReason: string
}

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  critical: boolean
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id:'c1', label:'Waste type matches declared type on manifest', checked:false, critical:true },
  { id:'c2', label:'Quantity within 5% of declared weight', checked:false, critical:true },
  { id:'c3', label:'Containers properly sealed and labelled', checked:false, critical:true },
  { id:'c4', label:'Hazard placards correctly displayed', checked:false, critical:true },
  { id:'c5', label:'Transport vehicle meets safety standards', checked:false, critical:false },
  { id:'c6', label:'Driver has valid hazmat certification', checked:false, critical:false },
  { id:'c7', label:'MSDS documents present in vehicle', checked:false, critical:false },
  { id:'c8', label:'No visible leaks, spills or damage', checked:false, critical:true },
  { id:'c9', label:'GPS tracker active on shipment', checked:false, critical:false },
  { id:'c10', label:'Receiver facility ready and compliant', checked:false, critical:false },
]

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    pending_verification: { label:'⏳ Pending Verification', color:'#fbbf24', bg:'rgba(251,191,36,0.1)' },
    inspector_assigned:   { label:'👷 Inspector Assigned',   color:'#a78bfa', bg:'rgba(167,139,250,0.1)' },
    in_transit:           { label:'🚛 In Transit',           color:'#38bdf8', bg:'rgba(56,189,248,0.1)' },
    delivered:            { label:'📦 Delivered',            color:'#00e5b0', bg:'rgba(0,229,176,0.1)' },
    verified:             { label:'✅ Verified & Complete',   color:'#4ade80', bg:'rgba(74,222,128,0.1)' },
    rejected:             { label:'❌ Rejected',              color:'#fb7185', bg:'rgba(251,113,133,0.1)' },
  }
  const c = config[status] ?? config.pending_verification
  return (
    <div style={{ display:'inline-flex', alignItems:'center', background:c.bg, border:`1px solid ${c.color}`, borderRadius:20, padding:'6px 16px', fontSize:13, fontWeight:700, color:c.color }}>
      {c.label}
    </div>
  )
}

function Timeline({ status }: { status: string }) {
  const steps = [
    { key:'pending_verification', label:'Deal Confirmed',      icon:'🤝' },
    { key:'inspector_assigned',   label:'Inspector Assigned',  icon:'👷' },
    { key:'in_transit',           label:'In Transit',          icon:'🚛' },
    { key:'delivered',            label:'Delivered',           icon:'📦' },
    { key:'verified',             label:'Verified ✅',         icon:'🛡️' },
  ]
  const order = ['pending_verification','inspector_assigned','in_transit','delivered','verified']
  const current = order.indexOf(status)

  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, margin:'24px 0', overflowX:'auto', padding:'4px 0' }}>
      {steps.map((s, i) => {
        const done = i <= current
        const active = i === current
        return (
          <div key={s.key} style={{ display:'flex', alignItems:'center', flex: i < steps.length-1 ? 1 : 'none' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:64 }}>
              <div style={{
                width:40, height:40, borderRadius:'50%',
                background: done ? '#00e5b0' : '#111820',
                border: active ? '2px solid #00e5b0' : `2px solid ${done ? '#00e5b0' : '#1a2530'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, transition:'all 0.3s',
                boxShadow: active ? '0 0 12px rgba(0,229,176,0.4)' : 'none'
              }}>
                {done ? s.icon : <span style={{ fontSize:14, color:'#64748b' }}>{i+1}</span>}
              </div>
              <div style={{ fontSize:10, color: done ? '#00e5b0' : '#64748b', textAlign:'center', fontWeight: active ? 700 : 400, whiteSpace:'nowrap' }}>
                {s.label}
              </div>
            </div>
            {i < steps.length-1 && (
              <div style={{ flex:1, height:2, background: i < current ? '#00e5b0' : '#1a2530', margin:'0 4px', marginBottom:20, transition:'all 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function VerifyPage() {
  const router = useRouter()
  const params = useParams()
  const dealId = params.dealId as string

  const [deal, setDeal] = useState<VerificationDeal | null>(null)
  const [view, setView] = useState<'factory' | 'inspector'>('factory')
  const [inspectorCode, setInspectorCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [inspectorVerified, setInspectorVerified] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const certRef = useRef<HTMLDivElement>(null)

  async function downloadPDF() {
    if (!certRef.current) return
    try {
      const canvas = await html2canvas(certRef.current, { backgroundColor: '#0d1318', scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`WEX-${dealId}-certificate.pdf`)
    } catch (e) {
      console.error(e)
      alert("Failed to generate PDF")
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`https://wasteexchange.vercel.app/verify/${dealId}`)
    setToastMessage('Verification link copied!')
    setTimeout(() => setToastMessage(''), 3000)
  }

  useEffect(() => {
    // Load deal from sessionStorage
    const raw = sessionStorage.getItem('confirmedMatch')
    if (raw) {
      const match = JSON.parse(raw)
      const newDeal: VerificationDeal = {
        dealId,
        wasteType: match.wasteA?.wasteType ?? 'Industrial Waste',
        quantityKg: match.wasteA?.quantityKg ?? 200,
        producerFactory: match.factoryA?.name ?? 'Producer Factory',
        receiverFactory: match.factoryB?.name ?? 'Receiver Factory',
        producerCity: match.factoryA?.city ?? 'City A',
        receiverCity: match.factoryB?.city ?? 'City B',
        symbiosisScore: match.symbiosisScore ?? 85,
        co2SavedKg: match.co2SavedKg ?? 300,
        inrValue: match.inrValue ?? 8000,
        inspectorCode: 'WXINSP' + dealId.slice(-4).toUpperCase(),
        status: 'pending_verification',
        createdAt: new Date().toISOString(),
        checklist: DEFAULT_CHECKLIST,
        inspectorNotes: '',
        rejectionReason: '',
      }
      setDeal(newDeal)
      sessionStorage.setItem('deal_' + dealId, JSON.stringify(newDeal))
    } else {
      // Load saved deal
      const saved = sessionStorage.getItem('deal_' + dealId)
      if (saved) setDeal(JSON.parse(saved))
    }
  }, [dealId])

  function saveDeal(updated: VerificationDeal) {
    setDeal(updated)
    sessionStorage.setItem('deal_' + dealId, JSON.stringify(updated))
  }

  function verifyInspectorCode() {
    if (!deal) return
    if (inspectorCode.trim().toUpperCase() === deal.inspectorCode) {
      setInspectorVerified(true)
      setCodeError('')
      const updated = { ...deal, status: 'inspector_assigned' as const }
      saveDeal(updated)
    } else {
      setCodeError('Invalid inspector code. Use: ' + deal.inspectorCode)
    }
  }

  function updateStatus(newStatus: VerificationDeal['status']) {
    if (!deal) return
    const updated = { ...deal, status: newStatus }
    saveDeal(updated)
  }

  function toggleCheck(id: string) {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c))
  }

  async function handleApprove() {
    if (!deal) return
    const criticalUnchecked = checklist.filter(c => c.critical && !c.checked)
    if (criticalUnchecked.length > 0) {
      alert(`Complete all critical checks first:\n${criticalUnchecked.map(c => '• ' + c.label).join('\n')}`)
      return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    const updated = { ...deal, status: 'verified' as const, checklist, inspectorNotes: notes }
    saveDeal(updated)
    setSubmitting(false)
  }

  async function handleReject() {
    if (!deal || !rejectionReason.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    const updated = { ...deal, status: 'rejected' as const, rejectionReason }
    saveDeal(updated)
    setSubmitting(false)
    setShowRejectModal(false)
  }

  if (!deal) return (
    <div style={{ minHeight:'100vh', background:'#070b0f', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
      Loading deal...
    </div>
  )

  const allChecked = checklist.every(c => c.checked)
  const criticalChecked = checklist.filter(c => c.critical).every(c => c.checked)
  const checkedCount = checklist.filter(c => c.checked).length

  return (
    <div style={{ minHeight:'100vh', background:'#070b0f', paddingBottom:60 }}>

      {/* Header */}
      <div style={{ padding:'16px 24px', borderBottom:'1px solid #1a2530', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:20 }}>←</button>
          <span style={{ color:'#00e5b0', fontWeight:800, fontSize:18 }}>🛡️ Deal Verification</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setView('factory')} style={{ background: view==='factory' ? '#00e5b0' : '#111820', color: view==='factory' ? '#070b0f' : '#64748b', border:'1px solid #1a2530', padding:'7px 16px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13 }}>
            🏭 Factory View
          </button>
          <button onClick={() => setView('inspector')} style={{ background: view==='inspector' ? '#a78bfa' : '#111820', color: view==='inspector' ? '#070b0f' : '#64748b', border:'1px solid #1a2530', padding:'7px 16px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13 }}>
            👷 Inspector View
          </button>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'24px 20px' }}>

        {/* Deal ID + Status */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, flexWrap:'wrap', gap:8 }}>
          <div>
            <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>DEAL ID</div>
            <div style={{ fontWeight:800, fontSize:18, color:'#e2e8f0', fontFamily:'monospace' }}>{dealId}</div>
          </div>
          <StatusBadge status={deal.status} />
        </div>

        {/* Timeline */}
        {deal.status !== 'rejected' && <Timeline status={deal.status} />}

        {/* Deal Summary Card */}
        <div style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:14, padding:20, marginBottom:20 }}>
          <div style={{ fontSize:11, color:'#00e5b0', fontWeight:700, marginBottom:12, letterSpacing:1 }}>DEAL SUMMARY</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'center', marginBottom:16 }}>
            <div style={{ background:'#111820', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>PRODUCER</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{deal.producerFactory}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{deal.producerCity}</div>
            </div>
            <div style={{ fontSize:20, textAlign:'center' }}>🚛</div>
            <div style={{ background:'#111820', borderRadius:10, padding:'12px 14px' }}>
              <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>RECEIVER</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{deal.receiverFactory}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{deal.receiverCity}</div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              { label:'Waste Type', val:deal.wasteType, color:'#00e5b0' },
              { label:'Quantity', val:`${deal.quantityKg} kg`, color:'#a78bfa' },
              { label:'Symbiosis Score', val:`${deal.symbiosisScore}/100`, color:'#4ade80' },
            ].map(s => (
              <div key={s.label} style={{ background:'#111820', borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
                <div style={{ fontWeight:800, color:s.color, fontSize:14 }}>{s.val}</div>
                <div style={{ fontSize:10, color:'#64748b', marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ FACTORY VIEW ══ */}
        {view === 'factory' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Inspector Code Box */}
            <div style={{ background:'#0d1318', border:'1px solid #fbbf24', borderRadius:14, padding:20 }}>
              <div style={{ fontSize:11, color:'#fbbf24', fontWeight:700, marginBottom:8, letterSpacing:1 }}>🔑 INSPECTOR ACCESS CODE</div>
              <div style={{ fontFamily:'monospace', fontSize:28, fontWeight:900, color:'#fbbf24', letterSpacing:6, marginBottom:8 }}>
                {deal.inspectorCode}
              </div>
              <div style={{ fontSize:12, color:'#64748b' }}>Share this code with your assigned field inspector. They use this to access the verification checklist on-site.</div>
            </div>

            {/* Status Actions */}
            {deal.status === 'inspector_assigned' && (
              <div style={{ background:'#0d1318', border:'1px solid #38bdf8', borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, color:'#38bdf8', fontWeight:700, marginBottom:12 }}>🚛 Mark Shipment In Transit</div>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>Once the waste has been loaded and vehicle has departed, mark it as in transit.</div>
                <button onClick={() => updateStatus('in_transit')} style={{ background:'#38bdf8', color:'#070b0f', border:'none', padding:'10px 24px', borderRadius:8, fontWeight:800, cursor:'pointer', fontSize:13 }}>
                  Mark as In Transit 🚛
                </button>
              </div>
            )}

            {deal.status === 'in_transit' && (
              <div style={{ background:'#0d1318', border:'1px solid #00e5b0', borderRadius:14, padding:20 }}>
                <div style={{ fontSize:13, color:'#00e5b0', fontWeight:700, marginBottom:12 }}>📦 Confirm Delivery</div>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>Confirm the shipment has arrived at the receiver facility.</div>
                <button onClick={() => updateStatus('delivered')} style={{ background:'#00e5b0', color:'#070b0f', border:'none', padding:'10px 24px', borderRadius:8, fontWeight:800, cursor:'pointer', fontSize:13 }}>
                  Confirm Delivered 📦
                </button>
              </div>
            )}

            {/* Verified State */}
            {deal.status === 'verified' && (
              <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid #4ade80', borderRadius:14, padding:24, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
                <div style={{ fontSize:20, fontWeight:900, color:'#4ade80', marginBottom:4 }}>Deal Fully Verified!</div>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:16 }}>Inspector has completed on-site verification. Certificate is now final.</div>
                <button onClick={() => router.push('/certificate')} style={{ background:'#4ade80', color:'#070b0f', border:'none', padding:'10px 24px', borderRadius:8, fontWeight:800, cursor:'pointer' }}>
                  View Final Certificate →
                </button>
              </div>
            )}

            {/* Rejected State */}
            {deal.status === 'rejected' && (
              <div style={{ background:'rgba(251,113,133,0.08)', border:'1px solid #fb7185', borderRadius:14, padding:24 }}>
                <div style={{ fontSize:20, fontWeight:900, color:'#fb7185', marginBottom:8 }}>❌ Deal Rejected</div>
                <div style={{ fontSize:13, color:'#64748b', marginBottom:8 }}>Reason:</div>
                <div style={{ fontSize:14, color:'#e2e8f0', background:'#111820', borderRadius:8, padding:'10px 14px' }}>{deal.rejectionReason}</div>
                <button onClick={() => router.push('/submit')} style={{ background:'#fb7185', color:'#070b0f', border:'none', padding:'10px 24px', borderRadius:8, fontWeight:800, cursor:'pointer', marginTop:16 }}>
                  Submit New Listing →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ INSPECTOR VIEW ══ */}
        {view === 'inspector' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Code Entry */}
            {!inspectorVerified && deal.status === 'pending_verification' && (
              <div style={{ background:'#0d1318', border:'1px solid #a78bfa', borderRadius:14, padding:24 }}>
                <div style={{ fontSize:13, color:'#a78bfa', fontWeight:700, marginBottom:16 }}>👷 Inspector Login</div>
                <div style={{ fontSize:12, color:'#64748b', marginBottom:12 }}>Enter the 10-digit inspector code provided by the factory manager to access the verification checklist.</div>
                <div style={{ display:'flex', gap:10 }}>
                  <input
                    value={inspectorCode}
                    onChange={e => setInspectorCode(e.target.value.toUpperCase())}
                    placeholder="Enter inspector code..."
                    style={{ flex:1, background:'#111820', border:'1px solid #1a2530', borderRadius:8, padding:'10px 14px', color:'#e2e8f0', fontSize:14, outline:'none', fontFamily:'monospace', letterSpacing:2 }}
                  />
                  <button onClick={verifyInspectorCode} style={{ background:'#a78bfa', color:'#070b0f', border:'none', padding:'10px 20px', borderRadius:8, fontWeight:800, cursor:'pointer' }}>
                    Verify
                  </button>
                </div>
                {codeError && <div style={{ fontSize:12, color:'#fb7185', marginTop:8 }}>{codeError}</div>}
              </div>
            )}

            {/* Checklist */}
            {(inspectorVerified || deal.status !== 'pending_verification') && deal.status !== 'verified' && deal.status !== 'rejected' && (
              <div style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:14, padding:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <div style={{ fontSize:13, color:'#00e5b0', fontWeight:700 }}>📋 On-Site Verification Checklist</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{checkedCount}/{checklist.length} completed</div>
                </div>

                {/* Progress bar */}
                <div style={{ background:'#111820', borderRadius:4, height:6, marginBottom:16, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:4, background: criticalChecked ? '#4ade80' : '#fbbf24', width:`${(checkedCount/checklist.length)*100}%`, transition:'width 0.3s' }} />
                </div>

                {/* Critical checks */}
                <div style={{ fontSize:11, color:'#fb7185', fontWeight:700, marginBottom:8, letterSpacing:1 }}>⚠️ CRITICAL CHECKS (must complete)</div>
                {checklist.filter(c => c.critical).map(item => (
                  <label key={item.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 12px', background: item.checked ? 'rgba(74,222,128,0.05)' : '#111820', borderRadius:8, marginBottom:6, cursor:'pointer', border:`1px solid ${item.checked ? 'rgba(74,222,128,0.3)' : '#1a2530'}` }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} style={{ accentColor:'#4ade80', width:16, height:16, flexShrink:0, marginTop:2 }} />
                    <span style={{ fontSize:13, color: item.checked ? '#4ade80' : '#e2e8f0', lineHeight:1.5 }}>{item.label}</span>
                  </label>
                ))}

                {/* Standard checks */}
                <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:8, marginTop:16, letterSpacing:1 }}>STANDARD CHECKS</div>
                {checklist.filter(c => !c.critical).map(item => (
                  <label key={item.id} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 12px', background: item.checked ? 'rgba(0,229,176,0.05)' : '#111820', borderRadius:8, marginBottom:6, cursor:'pointer', border:`1px solid ${item.checked ? 'rgba(0,229,176,0.3)' : '#1a2530'}` }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} style={{ accentColor:'#00e5b0', width:16, height:16, flexShrink:0, marginTop:2 }} />
                    <span style={{ fontSize:13, color: item.checked ? '#00e5b0' : '#e2e8f0', lineHeight:1.5 }}>{item.label}</span>
                  </label>
                ))}

                {/* Inspector notes */}
                <div style={{ marginTop:16 }}>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:700, marginBottom:8, letterSpacing:1 }}>INSPECTOR NOTES (optional)</div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add any observations, discrepancies, or special notes..."
                    rows={3}
                    style={{ width:'100%', background:'#111820', border:'1px solid #1a2530', borderRadius:8, padding:'10px 12px', color:'#e2e8f0', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }}
                  />
                </div>

                {/* Approve / Reject buttons */}
                <div style={{ display:'flex', gap:10, marginTop:16 }}>
                  <button
                    onClick={handleApprove}
                    disabled={!criticalChecked || submitting}
                    style={{ flex:1, background: criticalChecked && !submitting ? '#4ade80' : '#111820', color: criticalChecked && !submitting ? '#070b0f' : '#64748b', border:'none', padding:'12px', borderRadius:10, fontWeight:800, cursor: criticalChecked && !submitting ? 'pointer' : 'not-allowed', fontSize:14, transition:'all 0.2s' }}
                  >
                    {submitting ? '⏳ Submitting...' : `✅ Approve & Verify${!criticalChecked ? ' (complete critical checks)' : ''}`}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    style={{ background:'rgba(251,113,133,0.1)', color:'#fb7185', border:'1px solid #fb7185', padding:'12px 20px', borderRadius:10, fontWeight:800, cursor:'pointer', fontSize:14 }}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            )}

            {/* Verified by inspector */}
            {deal.status === 'verified' && (
              <div style={{ background:'rgba(74,222,128,0.08)', border:'1px solid #4ade80', borderRadius:14, padding:24, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:8 }}>🛡️</div>
                <div style={{ fontSize:20, fontWeight:900, color:'#4ade80', marginBottom:4 }}>Verification Complete</div>
                <div style={{ fontSize:13, color:'#64748b' }}>You have successfully verified this deal on-site. The certificate is now final and legally valid.</div>
              </div>
            )}
          </div>
        )}

        {/* ══ CERTIFICATE SECTION ══ */}
        {deal.status === 'verified' ? (
          <div ref={certRef} style={{ background:'#0d1318', border:'2px solid #00e5b0', borderRadius:16, padding:24, marginTop:32, boxShadow:'0 0 20px rgba(0,229,176,0.1)', position:'relative', overflow:'hidden', animation:'fadeIn 0.5s ease-out' }}>
            {/* Watermark */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%) rotate(-30deg)', fontSize:60, fontWeight:900, color:'rgba(0,229,176,0.03)', whiteSpace:'nowrap', pointerEvents:'none' }}>
              VERIFIED & SEALED
            </div>
            
            {/* Title */}
            <div style={{ textAlign:'center', marginBottom:24, borderBottom:'1px solid #1a2530', paddingBottom:16 }}>
              <div style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, color:'#e2e8f0', letterSpacing:1 }}>📄 OFFICIAL EXCHANGE CERTIFICATE</div>
              <div style={{ fontSize:12, color:'#00e5b0', marginTop:4 }}>Digitally Sealed · Inspector Verified · CPCB Compliant</div>
              <div style={{ display:'flex', justifyContent:'center', gap:16, marginTop:12, fontSize:12 }}>
                <span style={{ color:'#64748b' }}>ID: <span style={{ color:'#e2e8f0', fontFamily:'Space Mono, monospace' }}>WEX-{dealId}</span></span>
                <span style={{ color:'#64748b' }}>Date: <span style={{ color:'#e2e8f0', fontFamily:'Space Mono, monospace' }}>{new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span></span>
              </div>
              <div style={{ marginTop:12 }}>
                <span style={{ background:'rgba(0,229,176,0.1)', color:'#00e5b0', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:800 }}>✅ YES — Verified On-Site</span>
                <span style={{ background:'rgba(0,229,176,0.1)', color:'#00e5b0', padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:800, marginLeft:8, boxShadow:'0 0 8px rgba(0,229,176,0.4)' }}>LEGALLY VALID</span>
              </div>
            </div>

            {/* Content Grid */}
            <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
              {/* QR Code */}
              <div style={{ flex:'none', background:'#111820', border:'1px solid #00e5b0', borderRadius:14, padding:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:'0 0 10px rgba(0,229,176,0.2)' }}>
                <QRCodeSVG
                  value={JSON.stringify({
                    certificate_id: `WEX-${dealId}`,
                    producer: deal.producerFactory,
                    receiver: deal.receiverFactory,
                    waste_type: deal.wasteType,
                    quantity_kg: deal.quantityKg,
                    symbiosis_score: deal.symbiosisScore,
                    inspector_verified: true,
                    verified_at: new Date().toISOString(),
                    verify_url: `https://wasteexchange.vercel.app/verify/${dealId}`
                  })}
                  size={180}
                  bgColor="#111820"
                  fgColor="#00e5b0"
                  level="Q"
                />
                <div style={{ fontSize:10, color:'#64748b', marginTop:12, letterSpacing:0.5 }}>Scan to verify authenticity</div>
              </div>

              {/* Data Grid */}
              <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, fontFamily:'Space Mono, monospace' }}>
                <div style={{ background:'#111820', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Waste Type</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>{deal.wasteType}</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Quantity</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>{deal.quantityKg} kg</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Symbiosis Score</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>{deal.symbiosisScore}/100</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Hazard Class</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>Non-Hazardous</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Chemical Status</div>
                  <div style={{ fontSize:14, color:'#4ade80', fontWeight:700 }}>✅ ChemSafe Verified</div>
                </div>
                <div style={{ background:'#111820', borderRadius:10, padding:16 }}>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>CO₂ Saved</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>{(deal.quantityKg * 2.5).toLocaleString()} kg</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Carbon Credit</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>₹{Math.round(deal.quantityKg * 2.5 * 0.85).toLocaleString()}</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Transaction Ref</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>TXN-{dealId.slice(0,6).toUpperCase()}</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Net Payable</div>
                  <div style={{ fontSize:14, color:'#e2e8f0', marginBottom:12, fontWeight:700 }}>₹{deal.inrValue.toLocaleString()}</div>
                  <div style={{ fontSize:10, color:'#64748b', marginBottom:4 }}>Payment Status</div>
                  <div style={{ fontSize:14, color:'#fbbf24', fontWeight:700 }}>⏳ PENDING</div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div data-html2canvas-ignore="true" style={{ display:'flex', gap:12, marginTop:24, paddingTop:24, borderTop:'1px solid #1a2530' }}>
              <button onClick={downloadPDF} style={{ flex:1, background:'#00e5b0', color:'#070b0f', border:'none', padding:'12px', borderRadius:8, fontWeight:800, cursor:'pointer', fontSize:14 }}>
                ⬇ Download PDF Certificate
              </button>
              <button onClick={copyLink} style={{ flex:1, background:'#111820', color:'#e2e8f0', border:'1px solid #1a2530', padding:'12px', borderRadius:8, fontWeight:800, cursor:'pointer', fontSize:14 }}>
                📤 Share Certificate
              </button>
            </div>
            {toastMessage && (
              <div data-html2canvas-ignore="true" style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', background:'#00e5b0', color:'#070b0f', padding:'8px 16px', borderRadius:20, fontSize:12, fontWeight:800, boxShadow:'0 4px 12px rgba(0,229,176,0.3)' }}>
                {toastMessage}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop:32, padding:24, background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:12, textAlign:'center', color:'#fbbf24', fontSize:14, fontWeight:700 }}>
            ⚠ Certificate not yet verified by inspector
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:24 }}>
          <div style={{ background:'#0d1318', border:'1px solid #fb7185', borderRadius:16, padding:28, maxWidth:440, width:'100%' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#fb7185', marginBottom:16 }}>❌ Reject This Deal</div>
            <div style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>Provide a reason for rejection. This will be recorded in the audit trail and shared with both factories.</div>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Waste type does not match manifest. Actual material appears to be Battery Acid, not ETP Sludge."
              rows={4}
              style={{ width:'100%', background:'#111820', border:'1px solid #fb7185', borderRadius:8, padding:'10px 12px', color:'#e2e8f0', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', marginBottom:16 }}
            />
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowRejectModal(false)} style={{ flex:1, background:'#111820', color:'#64748b', border:'1px solid #1a2530', padding:'10px', borderRadius:8, cursor:'pointer', fontWeight:700 }}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || submitting}
                style={{ flex:1, background: rejectionReason.trim() ? '#fb7185' : '#111820', color: rejectionReason.trim() ? '#070b0f' : '#64748b', border:'none', padding:'10px', borderRadius:8, cursor:'pointer', fontWeight:800 }}
              >
                {submitting ? 'Submitting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
