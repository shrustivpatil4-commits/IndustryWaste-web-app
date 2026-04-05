import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weight_kg = Number(searchParams.get('weight_kg') || 0);
  const distance_km = Number(searchParams.get('distance_km') || 0);

  const co2_saved_kg = Math.max(0, (weight_kg * 2.5) - (distance_km * 0.21));
  const carbon_credit_inr = co2_saved_kg * 0.85;

  return NextResponse.json({
    co2_saved_kg: Number(co2_saved_kg.toFixed(2)),
    carbon_credit_inr: Math.floor(carbon_credit_inr)
  });
}
