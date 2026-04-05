import { NextResponse } from 'next/server';
import wasteTypes from '@/data/waste_types.json';

export async function POST(request: Request) {
  try {
    const { waste_type, hazard_level, volume_kg, pincode } = await request.json();
    
    const matchedType = wasteTypes.find((w: any) => 
       w.name.toLowerCase().includes(waste_type.toLowerCase()) || 
       w.tags.some((t: string) => t.toLowerCase() === waste_type.toLowerCase())
    ) || wasteTypes[0];
    
    return NextResponse.json({
      category: matchedType.tags[0] || 'Unknown',
      hazard_summary: `Class ${hazard_level} Hazard - Handling SOPs apply`,
      canonical_waste_object: {
        id: matchedType.id,
        name: matchedType.name,
        tags: matchedType.tags,
        hazard_class: hazard_level,
        volume_offered: volume_kg,
        pincode: pincode,
        unit: 'kg'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
