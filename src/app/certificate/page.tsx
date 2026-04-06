"use client";

import React from 'react';
import Link from 'next/link';

export default function CertificatePage() {
  return (
    <div style={{ minHeight:'100vh', background:'#070b0f', color:'#e2e8f0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0d1318', border:'1px solid #1a2530', borderRadius:14, padding:40, maxWidth:600, width:'100%', textAlign:'center' }}>
        <h1 style={{ color:'#00e5b0', fontSize:32, marginBottom:16 }}>📜 Digital Certificate</h1>
        
        <p style={{ color:'#e2e8f0', marginBottom:24 }}>
          This WasteExchange certificate officially documents the legal transfer and recycling of the industrial waste materials.
        </p>
        
        <div style={{ border:'1px solid rgba(0,229,176,0.3)', background:'rgba(0,229,176,0.05)', padding:20, borderRadius:10, marginBottom:20 }}>
           <h3 style={{ color:'#00e5b0', fontSize:18, fontWeight:'bold' }}>ChemSafe™ Verified Linkage</h3>
           <p style={{ fontSize:12, color:'#64748b', marginTop:8 }}>The materials have been computationally modeled and marked compliant for symbiosis.</p>
        </div>

        {/* STEP 3 Injection */}
        <div style={{ background:'rgba(74,222,128,0.08)', border:'2px solid #4ade80', borderRadius:8, padding:'12px 16px', textAlign:'center', marginTop:12 }}>
          <div style={{ fontSize:14, fontWeight:900, color:'#4ade80', letterSpacing:2 }}>🛡️ INSPECTOR VERIFIED</div>
          <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>Physical verification completed by certified WasteXchange field inspector</div>
        </div>

        <div style={{ marginTop:40 }}>
           <Link href="/dashboard">
             <button style={{ background:'#00e5b0', color:'#070b0f', padding:'12px 24px', borderRadius:8, border:'none', fontWeight:'bold', cursor:'pointer' }}>
               Back to Dashboard
             </button>
           </Link>
        </div>
      </div>
    </div>
  );
}
