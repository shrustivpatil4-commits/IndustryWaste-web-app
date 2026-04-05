import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST(request: Request) {
  try {
    const deal = await request.json();
    // Expected: factory_name, waste_type, volume, symbiosis_score, co2_saved_kg, carbon_credit_inr
    
    // Create new PDF
    const doc = new jsPDF();
    
    doc.setFont('courier', 'bold');
    doc.setTextColor(0, 229, 176); // Teal
    doc.setFontSize(24);
    doc.text('WasteExchange', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`Deal ID: WX-${Date.now()}`, 130, 20);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, 25);
    
    doc.setDrawColor(0, 229, 176);
    doc.line(20, 30, 190, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Symbiosis Deal Certificate', 20, 45);
    
    doc.setFontSize(12);
    doc.text(`From: Platform User`, 20, 60);
    doc.text(`To: ${deal.factory_name}`, 20, 70);
    
    doc.text(`Waste Type: ${deal.waste_type || 'Industrial Waste'}`, 20, 90);
    doc.text(`Volume: ${deal.volume} kg`, 20, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Symbiosis Score: ${deal.symbiosis_score}/100`, 20, 115);
    
    doc.setTextColor(74, 222, 128); // Green
    doc.text(`Environmental Impact`, 20, 135);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`CO2 Saved: ${deal.co2_saved_kg} kg`, 20, 145);
    doc.text(`Carbon Credit Value: INR ${deal.carbon_credit_inr}`, 20, 155);
    
    // ChemSafe badge
    doc.setDrawColor(74, 222, 128);
    doc.setFillColor(240, 255, 240);
    doc.rect(20, 170, 70, 15, 'FD');
    doc.setTextColor(0, 120, 0);
    doc.text('✓ ChemSafe Verified', 25, 180);
    
    const pdfBuffer = doc.output('arraybuffer');
    
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="WasteExchange_Certificate.pdf"'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
