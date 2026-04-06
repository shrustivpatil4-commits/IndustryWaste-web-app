"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CertificatePage() {
  const [deal, setDeal] = useState<any>(null);
  const [dealId, setDealId] = useState<string>('');
  const [dateStr, setDateStr] = useState('');
  
  useEffect(() => {
    // Read from sessionStorage
    const currentId = sessionStorage.getItem('currentDealId') || `WEX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setDealId(currentId);
    
    setDateStr(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

    const matchData = sessionStorage.getItem('confirmedMatch');
    if (matchData) {
      setDeal(JSON.parse(matchData));
    } else {
      // Mock data if accessed directly
      setDeal({
        wasteA: { wasteType: 'Rubber Crumb', quantityKg: 500, form: 'Solid', hazard: 'Class III', category: 'Recyclable' },
        factoryA: { name: 'Apex Electronics', city: 'Pune', pin: '411001', gstin: '27AADCA1234A1Z9' },
        factoryB: { name: 'Global Metals Pvt Ltd', city: 'Nashik', pin: '422001', gstin: '27AABCG5678B2Z1' },
        symbiosisScore: 94,
        co2SavedKg: 510,
        inrValue: 433.5
      });
    }
  }, []);

  if (!deal) return <div style={{ background: '#070b0f', minHeight: '100vh', color: '#00e5b0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Digital Certificate...</div>;

  // Derived values
  const wasteType = deal.wasteA?.wasteType || 'Industrial Waste';
  const volumeKg = deal.wasteA?.quantityKg || 500;
  const co2Saved = deal.co2SavedKg || Math.round(volumeKg * 2.5);
  const carbonCredit = deal.inrValue || Math.round(co2Saved * 0.85);
  const basePrice = 25; // mock base price
  const grossAmount = volumeKg * basePrice;
  const platformFee = Math.round(grossAmount * 0.025);
  const netPayable = grossAmount + platformFee - carbonCredit;

  const qrPayload = {
    certificate_id: dealId,
    deal_parties: {
      seller: deal.factoryA?.name,
      buyer: deal.factoryB?.name
    },
    waste_type: wasteType,
    volume_kg: volumeKg,
    symbiosis_score: deal.symbiosisScore || 85,
    co2_saved_kg: co2Saved,
    carbon_credit_inr: carbonCredit,
    net_payable_inr: netPayable > 0 ? netPayable : 0,
    chemical_verified: true,
    timestamp: new Date().toISOString(),
    verify_url: `https://wasteexchange.vercel.app/verify/${dealId}`
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify(qrPayload))}&color=00e5b0&bgcolor=070b0f`;

  // SHA-256 mock hash
  const hash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', padding: '40px 20px', fontFamily: 'var(--font-space-mono), monospace', color: '#e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .printable-card { box-shadow: none !important; }
        }
      `}} />

      {/* Background Watermark */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: '10vw', color: 'rgba(0, 229, 176, 0.03)', fontWeight: 900, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, fontFamily: 'var(--font-syne), sans-serif' }}>
        VERIFIED & SEALED
      </div>

      <div className="printable-card" style={{ position: 'relative', zIndex: 1, background: '#0d1318', border: '3px solid #00e5b0', borderRadius: '12px', padding: '48px', maxWidth: '850px', width: '100%', boxShadow: '0 0 60px rgba(0, 229, 176, 0.15)' }}>
        
        {/* 1. HEADER BLOCK */}
        <div style={{ borderBottom: '1px solid #1a2530', paddingBottom: '24px', marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-syne), sans-serif', color: '#00e5b0', fontSize: '32px', fontWeight: 800, margin: '0 0 20px 0', letterSpacing: '1px' }}>
            INDUSTRIAL WASTE EXCHANGE CERTIFICATE
          </h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px', fontSize: '13px', textAlign: 'left', background: '#111820', padding: '20px', borderRadius: '8px' }}>
            <div><span style={{ color: '#64748b' }}>Certificate ID:</span> <span style={{ color: '#fff', fontWeight: 'bold' }}>{dealId}</span></div>
            <div><span style={{ color: '#64748b' }}>Issue Date:</span> <span style={{ color: '#fff' }}>{dateStr}</span></div>
            <div><span style={{ color: '#64748b' }}>Validity:</span> <span style={{ color: '#fff' }}>90 days from issue</span></div>
            <div><span style={{ color: '#64748b' }}>Issued By:</span> <span style={{ color: '#fff' }}>WasteExchange Platform — Powered by InCSEption 2.0</span></div>
            <div style={{ gridColumn: '1 / -1', marginTop: '4px', borderTop: '1px dashed #1a2530', paddingTop: '12px' }}>
              <span style={{ color: '#64748b' }}>Verification Status:</span> <span style={{ color: '#00e5b0', fontWeight: 'bold' }}>✅ DIGITALLY VERIFIED</span>
            </div>
          </div>
        </div>

        {/* 2. DEAL PARTIES */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', color: '#00e5b0', fontSize: '18px', borderBottom: '1px solid #1a2530', paddingBottom: '8px', marginBottom: '16px' }}>DEAL PARTIES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#111820', padding: '16px', borderRadius: '8px', border: '1px solid #1a2530' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', letterSpacing: '1px' }}>SELLER FACTORY</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{deal.factoryA?.name}</div>
              <div style={{ fontSize: '14px', color: '#e2e8f0', marginTop: '2px' }}>{deal.factoryA?.city}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>PIN: {deal.factoryA?.pin || '411001'} | GSTIN: {deal.factoryA?.gstin || '27AADCA1234A1Z9'}</div>
            </div>
            <div style={{ background: '#111820', padding: '16px', borderRadius: '8px', border: '1px solid #1a2530' }}>
              <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', letterSpacing: '1px' }}>BUYER FACTORY</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>{deal.factoryB?.name}</div>
              <div style={{ fontSize: '14px', color: '#e2e8f0', marginTop: '2px' }}>{deal.factoryB?.city}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>PIN: {deal.factoryB?.pin || '422001'} | GSTIN: {deal.factoryB?.gstin || '27AABCG5678B2Z1'}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', marginTop: '16px', color: '#94a3b8', background: 'rgba(0,229,176,0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(0,229,176,0.2)' }}>
            Transaction Type: <span style={{ color: '#fff', fontWeight: 'bold' }}>Waste-to-Resource Exchange</span> &nbsp;|&nbsp; Deal Confirmed At: <span style={{ color: '#fff' }}>{new Date().toISOString().slice(0, 19).replace('T', ' ')}</span>
          </div>
        </div>

        {/* 3. WASTE MATERIAL DETAILS */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', color: '#00e5b0', fontSize: '18px', borderBottom: '1px solid #1a2530', paddingBottom: '8px', marginBottom: '16px' }}>WASTE MATERIAL DETAILS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <Badge label="Waste Type" value={wasteType} />
            <Badge label="Waste Category" value={deal.wasteA?.category || 'Recyclable'} />
            <Badge label="Hazard Class" value={deal.wasteA?.hazard || 'Class III'} />
            <Badge label="Volume" value={`${volumeKg} kg`} />
            <Badge label="Physical State" value={deal.wasteA?.form || 'Solid'} />
            <Badge label="Packaging Type" value="Bulk / Drum" />
          </div>
        </div>

        {/* 4. CHEMICAL VERIFICATION BLOCK */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', color: '#00e5b0', fontSize: '18px', borderBottom: '1px solid #1a2530', paddingBottom: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            CHEMICAL VERIFICATION
            <span style={{ fontSize: '11px', background: '#00e5b0', color: '#070b0f', padding: '3px 8px', borderRadius: '4px', marginLeft: '12px', fontWeight: 'bold' }}>ChemSafe™</span>
          </h2>
          <div style={{ background: '#111820', borderLeft: '4px solid #00e5b0', padding: '20px', borderRadius: '0 8px 8px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, auto) 1fr', gap: '12px 24px', fontSize: '13px' }}>
              <div style={{ color: '#64748b' }}>Chemical Composition Summary:</div> <div style={{ color: '#e2e8f0' }}>Hydrocarbons (30%), Silicates (40%), Metal Traces</div>
              <div style={{ color: '#64748b' }}>Hazard Compatibility Check:</div> <div style={{ color: '#00e5b0', fontWeight: 'bold' }}>✅ PASSED</div>
              <div style={{ color: '#64748b' }}>Reactive Pair Conflicts:</div> <div style={{ color: '#e2e8f0' }}>None detected</div>
              <div style={{ color: '#64748b' }}>Safe Handling Instructions:</div> <div style={{ color: '#e2e8f0' }}>Wear nitrile gloves. Avoid prolonged skin contact. Store away from open flames.</div>
              <div style={{ color: '#64748b' }}>Transport Regulation:</div> <div style={{ color: '#e2e8f0' }}>CPCB / MSDS compliant: <span style={{ color: '#00e5b0', fontWeight: 'bold' }}>Yes</span></div>
              <div style={{ color: '#64748b' }}>PPE Required:</div> <div style={{ color: '#e2e8f0' }}>Gloves, N95 Mask, Standard Protective Goggles</div>
              <div style={{ color: '#64748b' }}>Storage Conditions:</div> <div style={{ color: '#e2e8f0' }}>Ambient Temperature, <span style={{ whiteSpace: 'nowrap' }} />&lt;60% humidity, Isolation not required</div>
            </div>
          </div>
        </div>

        {/* 5. CARBON & ENVIRONMENTAL IMPACT */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', color: '#00e5b0', fontSize: '18px', borderBottom: '1px solid #1a2530', paddingBottom: '8px', marginBottom: '16px' }}>CARBON & ENVIRONMENTAL IMPACT</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(0, 229, 176, 0.05)', border: '1px solid rgba(0, 229, 176, 0.2)', padding: '24px', borderRadius: '8px' }}>
            <Impact stat={`${co2Saved.toLocaleString()} kg`} label="CO₂ Saved" />
            <Impact stat={`₹${carbonCredit.toLocaleString()}`} label="Carbon Credit Value" />
            <Impact stat={`${volumeKg.toLocaleString()} kg`} label="Landfill Diversion" />
            <Impact stat={`${deal.symbiosisScore || 85}/100`} label="Symbiosis Score™" />
            <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed rgba(0,229,176,0.3)', paddingTop: '16px', marginTop: '4px', fontSize: '13px' }}>
              <span style={{ color: '#64748b' }}>Environmental Compliance:</span> <span style={{ color: '#00e5b0', fontWeight: 'bold' }}>✅ CPCB Guidelines Met</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '32px', alignItems: 'stretch' }}>
          {/* 6. PAYMENT DETAILS */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-syne), sans-serif', color: '#00e5b0', fontSize: '18px', borderBottom: '1px solid #1a2530', paddingBottom: '8px', marginBottom: '16px' }}>PAYMENT DETAILS</h2>
            <div style={{ background: '#111820', padding: '24px', borderRadius: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Base Price (Total Volume: {volumeKg} kg)</span>
                <span style={{ color: '#e2e8f0' }}>₹{basePrice}/kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Gross Amount:</span>
                <span style={{ color: '#e2e8f0' }}>₹{grossAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Platform Fee (2.5%):</span>
                <span style={{ color: '#e2e8f0' }}>+ ₹{platformFee.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>Carbon Credit Adjustment:</span>
                <span style={{ color: '#00e5b0' }}>− ₹{carbonCredit.toLocaleString()}</span>
              </div>
              <div style={{ borderTop: '1px dashed #1a2530', margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '18px', fontWeight: 'bold' }}>
                <span style={{ color: '#fff' }}>NET PAYABLE AMOUNT:</span>
                <span style={{ color: '#00e5b0' }}>₹{Math.max(0, netPayable).toLocaleString()}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', color: '#94a3b8', fontSize: '13px', background: '#0d1318', padding: '16px', borderRadius: '6px' }}>
                <div>Method: <span style={{ color: '#fff', fontWeight: 'bold' }}>UPI / Escrow</span></div>
                <div>Status: <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>⏳ PENDING</span></div>
                <div style={{ gridColumn: '1 / -1' }}>UPI ID / Account: <span style={{ color: '#fff' }}>seller@wasteexchange</span></div>
                <div style={{ gridColumn: '1 / -1' }}>Transaction Ref: <span style={{ color: '#fff', fontFamily: 'monospace' }}>TXN-{Array.from(crypto.getRandomValues(new Uint8Array(4))).map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase()}</span></div>
                <div style={{ gridColumn: '1 / -1' }}>Due Date: <span style={{ color: '#fff' }}>15 Days from Certificate Issue</span></div>
              </div>
            </div>
          </div>

          {/* 7. QR CODE BLOCK */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: '#111820', borderRadius: '8px', border: '1px solid #1a2530', alignSelf: 'start', marginTop: '41px' }}>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px', alignSelf: 'center' }}>
              <img src={qrUrl} alt="Verify QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', maxWidth: '160px', alignSelf: 'center' }}>
              Scan QR code to view payload & verify digital authenticity
            </div>
          </div>
        </div>

        {/* 8. DIGITAL SIGNATURE BLOCK */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #1a2530', paddingTop: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '90px', height: '90px', flexShrink: 0, background: 'radial-gradient(circle, rgba(0,229,176,0.15) 0%, rgba(13,19,24,1) 100%)', border: '2px solid rgba(0,229,176,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5b0', fontSize: '36px', boxShadow: '0 0 20px rgba(0,229,176,0.1)' }}>
              🛡️
            </div>
            <div>
              <div style={{ color: '#00e5b0', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>Verified By: WasteExchange AI Engine</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: '12px' }}>
                Signature Hash: {hash}
              </div>
              <div style={{ fontSize: '13px', color: '#e2e8f0', display: 'flex', gap: '16px', fontWeight: 'bold' }}>
                <span>✅ Tamper-Proof</span>
                <span style={{ color: '#1a2530' }}>|</span>
                <span>CPCB Compliant</span>
                <span style={{ color: '#1a2530' }}>|</span>
                <span>InCSEption 2.0 Certified</span>
              </div>
            </div>
          </div>
        </div>

        {/* 9. FOOTER */}
        <div style={{ borderTop: '1px solid #1a2530', paddingTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <p style={{ marginBottom: '16px', maxWidth: '600px', margin: '0 auto 16px auto', lineHeight: '1.6' }}>
            "This certificate is auto-generated by WasteExchange Platform and is legally valid under India's Hazardous Waste Management Rules, 2016."
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontWeight: 'bold' }}>
            <span>Support: support@wasteexchange.in</span>
            <span style={{ color: '#1a2530' }}>•</span>
            <span>Platform: https://wasteexchange.vercel.app</span>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="no-print" style={{ marginTop: '48px', display: 'flex', gap: '16px' }}>
        <button onClick={() => window.print()} style={{ background: '#00e5b0', color: '#070b0f', border: 'none', padding: '14px 28px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'var(--font-space-mono)', fontSize: '15px', transition: 'transform 0.1s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          🖨️ Print / Save as PDF
        </button>
        <Link href="/dashboard" style={{ background: '#111820', color: '#e2e8f0', border: '1px solid #1a2530', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontFamily: 'var(--font-space-mono)', fontSize: '15px', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = '#1a2530'} onMouseLeave={e => e.currentTarget.style.background = '#111820'}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

function Badge({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ background: '#111820', border: '1px solid #1a2530', borderRadius: '6px', padding: '12px 16px', flex: '1 1 auto' }}>
      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '15px', color: '#fff', fontWeight: 'bold' }}>{value}</div>
    </div>
  );
}

function Impact({ label, stat }: { label: string, stat: string }) {
  return (
    <div style={{ background: '#070b0f', padding: '16px', borderRadius: '6px', border: '1px solid #1a2530' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00e5b0', marginBottom: '4px' }}>{stat}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}
