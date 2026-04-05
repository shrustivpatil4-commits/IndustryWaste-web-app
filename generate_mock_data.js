const fs = require('fs');
const path = require('path');

const srcData = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(srcData)) {
    fs.mkdirSync(srcData, { recursive: true });
}

const wasteCategories = [
    { base: 'Spent Solvent', tags: ['solvent', 'chemical', 'liquid', 'flammable'] },
    { base: 'Fly Ash', tags: ['ash', 'solid', 'particulate', 'construction'] },
    { base: 'Copper Slag', tags: ['slag', 'metal', 'solid', 'abrasive'] },
    { base: 'Acid Effluent', tags: ['acid', 'liquid', 'corrosive', 'effluent'] },
    { base: 'Bagasse', tags: ['organic', 'biomass', 'solid', 'agriculture'] },
    { base: 'Plastic Granules', tags: ['plastic', 'polymer', 'solid', 'recyclable'] },
    { base: 'Aluminium Dross', tags: ['aluminium', 'metal', 'dross', 'solid'] },
    { base: 'Cotton Waste', tags: ['textile', 'organic', 'solid', 'combustible'] },
    { base: 'Chemical Sludge', tags: ['sludge', 'chemical', 'semi-solid', 'toxic'] },
    { base: 'Waste Oil', tags: ['oil', 'liquid', 'hydrocarbon', 'lubricant'] },
    { base: 'Iron Scrap', tags: ['iron', 'metal', 'solid', 'scrap'] },
    { base: 'Glass Cullet', tags: ['glass', 'solid', 'silica', 'recyclable'] },
    { base: 'Paper Sludge', tags: ['paper', 'sludge', 'organic', 'semi-solid'] },
    { base: 'Rubber Crumb', tags: ['rubber', 'solid', 'polymer', 'tyre'] },
    { base: 'Wood Chips', tags: ['wood', 'organic', 'solid', 'biomass'] },
    { base: 'Steel Turnings', tags: ['steel', 'metal', 'solid', 'scrap'] },
    { base: 'Battery Waste', tags: ['lead', 'acid', 'toxic', 'solid'] },
    { base: 'E-Waste', tags: ['electronic', 'metal', 'plastic', 'solid'] },
    { base: 'Phosphogypsum', tags: ['gypsum', 'chemical', 'solid', 'acidic'] },
    { base: 'Ceramic Waste', tags: ['ceramic', 'solid', 'inert', 'construction'] }
];

const units = ['kg', 'litres'];

const wasteTypes = [];
let idCounter = 1;
for (let i = 0; i < 50; i++) {
    const template = wasteCategories[i % wasteCategories.length];
    const hazard_class = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const unit = (template.tags.includes('liquid') || template.tags.includes('effluent')) ? 'litres' : 'kg';
    const variantId = Math.floor(i / wasteCategories.length) + 1;
    const name = variantId === 1 ? template.base : `${template.base} Type ${variantId}`;
    
    wasteTypes.push({
        id: `WT${idCounter.toString().padStart(3, '0')}`,
        name: name,
        tags: [...template.tags, `variant_${variantId}`],
        hazard_class: hazard_class,
        unit: unit,
        typical_volume: Math.floor(Math.random() * 9000) + 100,
        compatible_with: [],
        incompatible_with: [],
        base_price_per_unit: Math.floor(Math.random() * 100) + 5
    });
    idCounter++;
}

// Populate compatibilities
wasteTypes.forEach(wt => {
    // Random 3 compatible and 2 incompatible
    for (let c = 0; c < 3; c++) {
        const rand = wasteTypes[Math.floor(Math.random() * wasteTypes.length)].id;
        if (!wt.compatible_with.includes(rand) && rand !== wt.id) wt.compatible_with.push(rand);
    }
    for (let c = 0; c < 2; c++) {
        const rand = wasteTypes[Math.floor(Math.random() * wasteTypes.length)].id;
        if (!wt.incompatible_with.includes(rand) && rand !== wt.id && !wt.compatible_with.includes(rand)) {
            wt.incompatible_with.push(rand);
        }
    }
});

fs.writeFileSync(path.join(srcData, 'waste_types.json'), JSON.stringify(wasteTypes, null, 2));

const cities = [
    { city: 'Surat', lat: 21.1702, lon: 72.8311, pincode: '395003' },
    { city: 'Pune', lat: 18.5204, lon: 73.8567, pincode: '411001' },
    { city: 'Chennai', lat: 13.0827, lon: 80.2707, pincode: '600001' },
    { city: 'Ludhiana', lat: 30.9010, lon: 75.8573, pincode: '141001' },
    { city: 'Ahmedabad', lat: 23.0225, lon: 72.5714, pincode: '380001' },
    { city: 'Coimbatore', lat: 11.0168, lon: 76.9558, pincode: '641001' },
    { city: 'Nagpur', lat: 21.1458, lon: 79.0882, pincode: '440001' },
    { city: 'Vadodara', lat: 22.3072, lon: 73.1812, pincode: '390001' },
    { city: 'Mumbai', lat: 19.0760, lon: 72.8777, pincode: '400001' },
    { city: 'Delhi', lat: 28.7041, lon: 77.1025, pincode: '110001' }
];

const factories = [];
for (let i = 1; i <= 30; i++) {
    const cityData = cities[Math.floor(Math.random() * cities.length)];
    // Randomize lat lon slightly so they aren't directly on top
    const fLat = cityData.lat + (Math.random() - 0.5) * 0.1;
    const fLon = cityData.lon + (Math.random() - 0.5) * 0.1;

    // Pick 2-4 random waste outs and 2-4 waste ins
    const wasteOut = [];
    const wasteIn = [];
    
    for(let o=0; o<Math.floor(Math.random()*3)+2; o++) {
        wasteOut.push(wasteTypes[Math.floor(Math.random()*wasteTypes.length)].id);
    }
    for(let w=0; w<Math.floor(Math.random()*3)+2; w++) {
        wasteIn.push(wasteTypes[Math.floor(Math.random()*wasteTypes.length)].tags[0]);
    }

    factories.push({
        id: `FAC${i.toString().padStart(3, '0')}`,
        name: `Industrial Corp ${i} ${cityData.city}`,
        lat: fLat,
        lon: fLon,
        city: cityData.city,
        pincode: cityData.pincode,
        category: "Manufacturing",
        waste_out: [...new Set(wasteOut)],
        waste_in: [...new Set(wasteIn)]
    });
}
fs.writeFileSync(path.join(srcData, 'factories.json'), JSON.stringify(factories, null, 2));

console.log("Mock data generated.");
