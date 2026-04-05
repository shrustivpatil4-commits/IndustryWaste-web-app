import { NextResponse } from 'next/server';
import factories from '@/data/factories.json';
import wasteTypes from '@/data/waste_types.json';

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function POST(request: Request) {
  try {
    const waste = await request.json(); // canonical waste object
    
    // User coordinates (approximated from input pincode, we'll just mock it near Surat)
    const sourceLat = 21.1702;
    const sourceLon = 72.8311;

    const matches = factories.map((fac: any) => {
      // 1. Category match (40%)
      const categoryMatch = fac.waste_in.some((t: string) => waste.tags.includes(t)) ? 40 : 0;
      
      // 2. Proximity (30%) max 1000km range
      const dist = haversineDist(sourceLat, sourceLon, fac.lat, fac.lon);
      const proximityScore = dist < 1000 ? Math.max(0, 30 * (1 - dist / 1000)) : 0;
      
      // 3. Volume compatibility (20%) mock expected volume
      let expectedVolume = 5000;
      const volDiff = Math.abs(waste.volume_offered - expectedVolume);
      const volScore = volDiff < 5000 ? Math.max(0, 20 * (1 - volDiff / 5000)) : 0;
      
      // 4. Hazard compatibility (10%)
      const facMaxHazard = 3; // mock limit
      const hazardScore = Number(waste.hazard_class) <= facMaxHazard ? 10 : 0;
      
      const totalScore = Math.floor(categoryMatch + proximityScore + volScore + hazardScore);
      
      return {
        factory_id: fac.id,
        factory_name: fac.name,
        city: fac.city,
        symbiosis_score: totalScore,
        distance_km: Math.round(dist),
        hazard_compatible: Number(waste.hazard_class) <= facMaxHazard,
        price_offered_inr: Math.floor(waste.volume_offered * 12.5), // dummy price
        co2_saved_kg: Math.floor((waste.volume_offered * 2.5) - (dist * 0.21)),
        lat: fac.lat,
        lon: fac.lon,
        waste_in: fac.waste_in
      };
    });

    matches.sort((a, b) => b.symbiosis_score - a.symbiosis_score);
    return NextResponse.json(matches.slice(0, 3));
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
