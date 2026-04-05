import { NextResponse } from 'next/server';
import wasteTypes from '@/data/waste_types.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const waste_type_a = searchParams.get('waste_type_a');
  const waste_type_b = searchParams.get('waste_type_b');

  if (!waste_type_a || !waste_type_b) {
    return NextResponse.json({ safe: true, warning: null });
  }

  // Find id of A and B
  const typeA = wasteTypes.find((w: any) => w.id === waste_type_a || w.name === waste_type_a || w.tags.includes(waste_type_a));
  const typeB = wasteTypes.find((w: any) => w.id === waste_type_b || w.name === waste_type_b || w.tags.includes(waste_type_b));

  if (typeA && typeB && typeA.incompatible_with && typeA.incompatible_with.includes(typeB.id)) {
    return NextResponse.json({ 
        safe: false, 
        warning: `Violent reaction possible between ${typeA.name} and ${typeB.name}.`,
        handling_sop: "Keep stored in separate tertiary containment zones. Never transport in same vehicle."
    });
  }

  return NextResponse.json({ 
    safe: true, 
    warning: null,
    handling_sop: "Standard transit protocols apply."
  });
}
